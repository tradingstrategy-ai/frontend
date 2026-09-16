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
		json: { type: 'boolean', default: false }
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

/**
 * Search analytics for the last N days, grouped by a single dimension.
 * Search Console data lags ~2-3 days, so the window ends 3 days ago.
 */
async function searchAnalytics(token, dimension) {
	const days = Number.parseInt(options.days, 10);
	const rowLimit = Number.parseInt(options.limit, 10);
	const end = new Date();
	end.setUTCDate(end.getUTCDate() - 3);
	const start = new Date(end);
	start.setUTCDate(start.getUTCDate() - days);

	const json = await api(token, `${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
		startDate: isoDate(start),
		endDate: isoDate(end),
		dimensions: [dimension],
		rowLimit
	});

	if (dumpJson(json)) return;

	console.log(`\n${site} · top ${dimension}s by clicks · ${isoDate(start)} → ${isoDate(end)}`);
	console.table(
		(json.rows ?? []).map((row) => ({
			[dimension]: row.keys[0],
			clicks: row.clicks,
			impressions: row.impressions,
			ctr: `${(row.ctr * 100).toFixed(1)}%`,
			position: row.position.toFixed(1)
		}))
	);
}

const commands = {
	async sites(token) {
		const json = await api(token, `${API}/sites`);
		if (dumpJson(json)) return;
		console.table((json.siteEntry ?? []).map((s) => ({ site: s.siteUrl, permission: s.permissionLevel })));
	},

	pages: (token) => searchAnalytics(token, 'page'),
	queries: (token) => searchAnalytics(token, 'query'),

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
