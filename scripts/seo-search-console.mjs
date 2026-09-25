#!/usr/bin/env node

/**
 * Query the Google Search Console API for tradingstrategy.ai.
 *
 * Authenticates as a service account (no OAuth browser flow) by signing a JWT with the
 * private key from the downloaded service-account JSON and exchanging it for an access token.
 * The service account must be added as a user of the Search Console property
 * (Settings → Users and permissions).
 *
 * Usage:
 *
 *   pnpm run seo:search-console sites                     # properties the service account can see
 *   pnpm run seo:search-console pages --days 28 --limit 25
 *   pnpm run seo:search-console queries --days 28 --limit 25
 *   pnpm run seo:search-console sitemaps
 *   pnpm run seo:search-console inspect https://tradingstrategy.ai/some/page
 *   pnpm run seo:search-console pages --json              # raw API response
 *   pnpm run seo:search-console pages --page-regex '/vaults' --start 2026-09-01 --end 2026-09-24
 *   pnpm run seo:search-console templates --start 2026-09-16 --end 2026-09-24 --baseline-end 2026-09-15
 *   pnpm run seo:search-console terms --inspect           # scripts/seo-target-terms.json
 *
 * Requires in .env.local:
 *
 *   TS_PRIVATE_GOOGLE_SERVICE_ACCOUNT_FILE=~/.tradingstrategy/google-service-account.json
 *   TS_PRIVATE_SEARCH_CONSOLE_SITE=sc-domain:tradingstrategy.ai   (optional, this is the default)
 */
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { parseArgs } from 'node:util';
import { summariseByTemplate } from './seo-page-templates.mjs';

const API = 'https://www.googleapis.com/webmasters/v3';
const INSPECTION_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const {
	values: options,
	positionals: [command, positional]
} = parseArgs({
	// pnpm forwards a literal `--` from `pnpm run … -- --flag`; drop it so flags still parse
	args: process.argv.slice(2).filter((arg, i) => !(i === 0 && arg === '--')),
	allowPositionals: true,
	options: {
		days: { type: 'string', default: '28' },
		limit: { type: 'string', default: '25' },
		json: { type: 'boolean', default: false },
		// explicit window (YYYY-MM-DD); overrides --days
		start: { type: 'string' },
		end: { type: 'string' },
		// `templates`: the comparison window ends here; defaults to the day before --start
		'baseline-end': { type: 'string' },
		'page-regex': { type: 'string' },
		'exclude-page-regex': { type: 'string' },
		country: { type: 'string' },
		device: { type: 'string' },
		// `terms`: also run URL inspection for each landing page (Google-selected canonical)
		inspect: { type: 'boolean', default: false }
	}
});

const site = process.env.TS_PRIVATE_SEARCH_CONSOLE_SITE?.trim() || 'sc-domain:tradingstrategy.ai';
// Node does not expand `~`, so accept the shell-style path used in the docs
const credentialsFile = process.env.TS_PRIVATE_GOOGLE_SERVICE_ACCOUNT_FILE?.trim().replace(/^~(?=\/)/, homedir());

if (!credentialsFile) {
	console.error('TS_PRIVATE_GOOGLE_SERVICE_ACCOUNT_FILE is not set (add it to .env.local)');
	process.exit(1);
}

const base64url = (input) => Buffer.from(input).toString('base64url');

/**
 * Exchange a self-signed service-account JWT for a short-lived OAuth access token.
 *
 * @param {{ client_email: string, private_key: string }} credentials
 */
async function getAccessToken(credentials) {
	const now = Math.floor(Date.now() / 1000);
	const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const claims = base64url(
		JSON.stringify({
			iss: credentials.client_email,
			scope: SCOPE,
			aud: TOKEN_URL,
			iat: now,
			exp: now + 3600
		})
	);
	const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(credentials.private_key, 'base64url');

	const response = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: `${header}.${claims}.${signature}`
		})
	});
	const json = await response.json();
	if (!response.ok) {
		throw new Error(`token exchange failed: ${json.error_description ?? json.error ?? response.status}`);
	}
	return json.access_token;
}

/**
 * Authenticated JSON request against the Search Console APIs.
 */
async function api(token, url, body) {
	const response = await fetch(url, {
		method: body ? 'POST' : 'GET',
		headers: {
			authorization: `Bearer ${token}`,
			...(body ? { 'content-type': 'application/json' } : {})
		},
		body: body ? JSON.stringify(body) : undefined
	});
	const json = await response.json();
	if (!response.ok) {
		throw new Error(`${json.error?.status ?? response.status}: ${json.error?.message ?? 'unknown error'}`);
	}
	return json;
}

function isoDate(date) {
	return date.toISOString().slice(0, 10);
}

/** Print the raw API response when `--json` is set; returns whether it did. */
function dumpJson(json) {
	if (options.json) console.log(JSON.stringify(json, null, 2));
	return options.json;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse a YYYY-MM-DD option as a UTC date. */
function parseDate(value, name) {
	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) throw new Error(`--${name} must be YYYY-MM-DD, got ${value}`);
	return date;
}

/**
 * The reporting window: `--start`/`--end` when given, otherwise the last `--days` days.
 * Search Console data lags ~2-3 days, so the default window ends 3 days ago.
 */
function getWindow() {
	const end = options.end ? parseDate(options.end, 'end') : new Date(Date.now() - 3 * DAY_MS);
	const start = options.start
		? parseDate(options.start, 'start')
		: new Date(end.getTime() - Number.parseInt(options.days, 10) * DAY_MS);
	if (start > end) throw new Error('--start is after --end');
	return { startDate: isoDate(start), endDate: isoDate(end) };
}

/** Days in a window, both ends inclusive. */
function windowDays({ startDate, endDate }) {
	return Math.round((parseDate(endDate, 'end').getTime() - parseDate(startDate, 'start').getTime()) / DAY_MS) + 1;
}

/** `dimensionFilterGroups` from the --page-regex, --exclude-page-regex, --country and --device options. */
function getFilters() {
	const filters = [];
	if (options['page-regex'])
		filters.push({ dimension: 'page', operator: 'includingRegex', expression: options['page-regex'] });
	if (options['exclude-page-regex'])
		filters.push({ dimension: 'page', operator: 'excludingRegex', expression: options['exclude-page-regex'] });
	if (options.country) filters.push({ dimension: 'country', operator: 'equals', expression: options.country });
	if (options.device)
		filters.push({ dimension: 'device', operator: 'equals', expression: options.device.toUpperCase() });
	return filters.length ? [{ filters }] : undefined;
}

/**
 * Run a Search Analytics query and page through every row.
 *
 * Note that query-level rows omit anonymised queries, so their sum is below the page totals.
 */
async function queryAllRows(token, body) {
	const rows = [];
	for (let startRow = 0; ; startRow += 25000) {
		const json = await api(token, `${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
			...body,
			dimensionFilterGroups: getFilters(),
			rowLimit: 25000,
			startRow,
			dataState: 'all'
		});
		rows.push(...(json.rows ?? []));
		if (!json.rows || json.rows.length < 25000) return rows;
	}
}

const formatRow = (row) => ({
	clicks: row.clicks,
	impressions: row.impressions,
	ctr: `${(row.ctr * 100).toFixed(2)}%`,
	position: row.position.toFixed(1)
});

/**
 * Search analytics for the reporting window, grouped by a single dimension.
 */
async function searchAnalytics(token, dimension) {
	const window = getWindow();
	const rows = await queryAllRows(token, { ...window, dimensions: [dimension] });
	if (dumpJson({ rows })) return;

	const rowLimit = Number.parseInt(options.limit, 10);
	console.log(`\n${site} · top ${dimension}s by clicks · ${window.startDate} → ${window.endDate}`);
	console.table(rows.slice(0, rowLimit).map((row) => ({ [dimension]: row.keys[0], ...formatRow(row) })));
}

/**
 * Clicks, impressions, CTR and position per page template for the reporting window and an
 * equal-length baseline window before it, with daily rates so windows of any length compare.
 */
async function templates(token) {
	const current = getWindow();
	const days = windowDays(current);
	const baselineEnd = options['baseline-end']
		? parseDate(options['baseline-end'], 'baseline-end')
		: new Date(parseDate(current.startDate, 'start').getTime() - DAY_MS);
	const baseline = {
		startDate: isoDate(new Date(baselineEnd.getTime() - (days - 1) * DAY_MS)),
		endDate: isoDate(baselineEnd)
	};

	const [before, after] = await Promise.all(
		[baseline, current].map(async (window) =>
			summariseByTemplate(await queryAllRows(token, { ...window, dimensions: ['page'] }))
		)
	);
	if (dumpJson({ baseline, current, before: Object.fromEntries(before), after: Object.fromEntries(after) })) return;

	const names = [...new Set([...after.keys(), ...before.keys()])].sort(
		(a, b) => (after.get(b)?.impressions ?? 0) - (after.get(a)?.impressions ?? 0)
	);
	const empty = { pages: 0, clicks: 0, impressions: 0, ctr: 0, position: 0 };
	console.log(
		`\n${site} · per template · baseline ${baseline.startDate} → ${baseline.endDate} vs ${current.startDate} → ${current.endDate} (${days} days each)`
	);
	console.table(
		names.map((template) => {
			const a = before.get(template) ?? empty;
			const b = after.get(template) ?? empty;
			return {
				template,
				pages: `${a.pages} → ${b.pages}`,
				'clicks/day': `${(a.clicks / days).toFixed(1)} → ${(b.clicks / days).toFixed(1)}`,
				'impressions/day': `${Math.round(a.impressions / days)} → ${Math.round(b.impressions / days)}`,
				ctr: `${(a.ctr * 100).toFixed(2)}% → ${(b.ctr * 100).toFixed(2)}%`,
				position: `${a.position.toFixed(1)} → ${b.position.toFixed(1)}`
			};
		})
	);
}

/**
 * The fixed category and navigational query sets from `scripts/seo-target-terms.json`:
 * impressions, clicks and position per query, the page Google showed most, and whether that is
 * the intended landing page. `--inspect` adds the Google-selected canonical of each landing page.
 */
async function terms(token) {
	const window = getWindow();
	const targets = JSON.parse(await readFile(new URL('./seo-target-terms.json', import.meta.url), 'utf8'));
	const origin = 'https://tradingstrategy.ai';
	const allTerms = [...targets.category, ...targets.navigational];

	const rows = await queryAllRows(token, { ...window, dimensions: ['query', 'page'] });
	const byQuery = new Map();
	for (const row of rows) {
		const [query, page] = row.keys;
		if (!byQuery.has(query)) byQuery.set(query, []);
		byQuery.get(query).push({ page: page.replace(origin, ''), ...row });
	}

	const report = (term) => {
		const pages = (byQuery.get(term.query) ?? []).sort((a, b) => b.impressions - a.impressions);
		const impressions = pages.reduce((sum, row) => sum + row.impressions, 0);
		const clicks = pages.reduce((sum, row) => sum + row.clicks, 0);
		const position = impressions
			? pages.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions
			: null;
		const intended = term.landingPage && pages.find((row) => row.page === term.landingPage);
		return {
			query: term.query,
			impressions,
			clicks,
			position: position?.toFixed(1) ?? '—',
			'top page': pages[0]?.page ?? '—',
			'intended page position': term.landingPage ? (intended?.position.toFixed(1) ?? 'not shown') : '—'
		};
	};

	const category = targets.category.map(report);
	const navigational = targets.navigational.map(report);

	let canonicals;
	if (options.inspect) {
		const landingPages = [...new Set(allTerms.map((term) => term.landingPage).filter(Boolean))];
		canonicals = [];
		for (const path of landingPages) {
			const json = await api(token, INSPECTION_API, { inspectionUrl: `${origin}${path}`, siteUrl: site });
			const index = json.inspectionResult?.indexStatusResult ?? {};
			canonicals.push({
				page: path,
				coverage: index.coverageState,
				'google canonical': index.googleCanonical?.replace(origin, '') ?? '—',
				'matches page': index.googleCanonical ? index.googleCanonical === `${origin}${path}` : '—'
			});
		}
	}

	if (dumpJson({ window, category, navigational, canonicals })) return;

	const covered = category.filter((row) => row.impressions > 0).length;
	console.log(`\n${site} · category queries · ${window.startDate} → ${window.endDate}`);
	console.log(`${covered} of ${category.length} category queries have impressions`);
	console.table(category);
	console.log('\nNavigational queries (reported separately)');
	console.table(navigational);
	if (canonicals) {
		console.log('\nLanding pages — Google-selected canonical');
		console.table(canonicals);
	}
}

const commands = {
	async sites(token) {
		const json = await api(token, `${API}/sites`);
		if (dumpJson(json)) return;
		console.table((json.siteEntry ?? []).map((s) => ({ site: s.siteUrl, permission: s.permissionLevel })));
	},

	pages: (token) => searchAnalytics(token, 'page'),
	queries: (token) => searchAnalytics(token, 'query'),
	templates,
	terms,

	async sitemaps(token) {
		const json = await api(token, `${API}/sites/${encodeURIComponent(site)}/sitemaps`);
		if (dumpJson(json)) return;
		console.table(
			(json.sitemap ?? []).map((s) => ({
				path: s.path,
				submitted: s.contents?.reduce((sum, c) => sum + Number(c.submitted ?? 0), 0) ?? 0,
				indexed: s.contents?.reduce((sum, c) => sum + Number(c.indexed ?? 0), 0) ?? 0,
				errors: s.errors,
				warnings: s.warnings,
				lastDownloaded: s.lastDownloaded
			}))
		);
	},

	async inspect(token) {
		if (!positional) throw new Error('inspect requires a URL argument');
		const json = await api(token, INSPECTION_API, { inspectionUrl: positional, siteUrl: site });
		if (dumpJson(json)) return;
		const index = json.inspectionResult?.indexStatusResult ?? {};
		console.log(`\n${positional}`);
		console.table({
			verdict: index.verdict,
			coverage: index.coverageState,
			indexing: index.indexingState,
			robots: index.robotsTxtState,
			canonical: index.googleCanonical,
			lastCrawl: index.lastCrawlTime,
			crawledAs: index.crawledAs
		});
	}
};

if (!command || !(command in commands)) {
	console.error(`Usage: seo-search-console.mjs <${Object.keys(commands).join('|')}> [options]`);
	process.exit(1);
}

try {
	const credentials = JSON.parse(await readFile(credentialsFile, 'utf8'));
	const token = await getAccessToken(credentials);
	await commands[command](token);
} catch (error) {
	console.error(`Search Console request failed: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
}
