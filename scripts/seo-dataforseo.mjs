#!/usr/bin/env node

/**
 * Query the DataForSEO API for keyword and SERP data that Search Console cannot provide:
 * search volume and difficulty for queries we do not rank for yet, the live Google top results
 * for our target queries, and the keywords any domain (ours or a competitor's) ranks for.
 *
 * Every request except `balance` is billed to the DataForSEO account. Run `balance` first to
 * check the credentials, and see https://app.dataforseo.com/pricing for current rates.
 *
 * Usage:
 *
 *   pnpm run seo:dataforseo balance                       # free; checks credentials
 *   pnpm run seo:dataforseo volume                        # scripts/seo-target-terms.json
 *   pnpm run seo:dataforseo volume "usdc apy" "usdc interest rate"
 *   pnpm run seo:dataforseo serp --depth 20               # top results for each category term
 *   pnpm run seo:dataforseo serp --query "defi vaults"    # a single query
 *   pnpm run seo:dataforseo ranked vaults.fyi --limit 100 # keywords a domain ranks for
 *   pnpm run seo:dataforseo ranked defillama.com --match vault --match yield
 *   pnpm run seo:dataforseo ideas "stablecoin yield" "morpho vault" --limit 50
 *   pnpm run seo:dataforseo volume --location-code 2826   # United Kingdom instead of United States
 *   pnpm run seo:dataforseo volume --json                 # raw API response
 *
 * Requires in .env.local (API credentials from https://app.dataforseo.com/api-access,
 * not the account password):
 *
 *   TS_PRIVATE_DATAFORSEO_LOGIN=...
 *   TS_PRIVATE_DATAFORSEO_PASSWORD=...
 */
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const API = 'https://api.dataforseo.com/v3';
const OUR_DOMAIN = 'tradingstrategy.ai';
// DataForSEO reports success with this code at both the response and the task level
const OK = 20000;

const {
	values: options,
	positionals: [command, ...args]
} = parseArgs({
	// pnpm forwards a literal `--` from `pnpm run … -- --flag`; drop it so flags still parse
	args: process.argv.slice(2).filter((arg, i) => !(i === 0 && arg === '--')),
	allowPositionals: true,
	options: {
		// 2840 = United States; see /v3/dataforseo_labs/locations_and_languages for others
		'location-code': { type: 'string', default: '2840' },
		language: { type: 'string', default: 'en' },
		// `serp`: number of results to fetch per query; deeper results cost more
		depth: { type: 'string', default: '10' },
		// `serp`: a single query instead of the category terms
		query: { type: 'string' },
		// `ranked`, `ideas`: number of keywords to return (per seed for `ideas`)
		limit: { type: 'string', default: '50' },
		// `ranked`: only keywords containing any of these words
		match: { type: 'string', multiple: true },
		json: { type: 'boolean', default: false }
	}
});

const login = process.env.TS_PRIVATE_DATAFORSEO_LOGIN?.trim();
const password = process.env.TS_PRIVATE_DATAFORSEO_PASSWORD?.trim();

if (!login || !password) {
	console.error('TS_PRIVATE_DATAFORSEO_LOGIN and TS_PRIVATE_DATAFORSEO_PASSWORD must be set (add them to .env.local)');
	process.exit(1);
}

const authorization = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
// total cost reported by the API across all requests of this run
let spent = 0;

const target = { location_code: Number.parseInt(options['location-code'], 10), language_code: options.language };

/**
 * Call a DataForSEO endpoint and return the first task's result.
 *
 * DataForSEO answers HTTP 200 even for failed tasks, so both the response and task status codes
 * are checked. Every response reports its cost, which is summed into `spent`.
 *
 * @param {string} path endpoint path below /v3
 * @param {object[]} [tasks] POST body; omitted for GET endpoints
 */
async function api(path, tasks) {
	const response = await fetch(`${API}${path}`, {
		method: tasks ? 'POST' : 'GET',
		headers: { authorization, ...(tasks ? { 'content-type': 'application/json' } : {}) },
		body: tasks ? JSON.stringify(tasks) : undefined
	});
	const json = await response.json().catch(() => ({}));
	if (!response.ok || json.status_code !== OK) {
		throw new Error(`${json.status_code ?? response.status}: ${json.status_message ?? response.statusText}`);
	}
	spent += json.cost ?? 0;
	const task = json.tasks?.[0];
	if (task?.status_code !== OK) {
		throw new Error(`${path}: ${task?.status_code}: ${task?.status_message}`);
	}
	return task.result ?? [];
}

/** Print the raw API response when `--json` is set; returns whether it did. */
function dumpJson(json) {
	if (options.json) console.log(JSON.stringify(json, null, 2));
	return options.json;
}

async function loadTargetTerms() {
	return JSON.parse(await readFile(new URL('./seo-target-terms.json', import.meta.url), 'utf8'));
}

const keywordRow = (keyword, data) => ({
	keyword,
	volume: data?.keyword_info?.search_volume ?? '—',
	difficulty: data?.keyword_properties?.keyword_difficulty ?? '—',
	intent: data?.search_intent_info?.main_intent ?? '—'
});

const isOurs = (domain) => domain === OUR_DOMAIN || domain?.endsWith(`.${OUR_DOMAIN}`);

/**
 * The real site of an organic SERP item.
 *
 * Google now serves organic links as `google.com/goto?url=…` redirects, which DataForSEO passes
 * through as `url` and `domain`. The displayed breadcrumb (`https://www.example.com › docs › page`)
 * still names the site, so fall back to it. Video and social results show a date or like count
 * instead of a breadcrumb and resolve to `null`.
 *
 * @param {{ url?: string, breadcrumb?: string }} item
 * @returns {{ domain: string, path: string } | null}
 */
function resolveSite(item) {
	const url = item.url ? new URL(item.url) : null;
	if (url && !(url.hostname.endsWith('google.com') && url.pathname === '/goto')) {
		return { domain: url.hostname.replace(/^www\./, ''), path: url.pathname };
	}
	const match = item.breadcrumb?.match(/^https?:\/\/([^\s›]+)(.*)$/);
	if (!match) return null;
	const segments = match[2]
		.split('›')
		.map((segment) => segment.trim())
		.filter(Boolean);
	// breadcrumb segments are display labels and may be truncated with `...`, so the path is approximate
	return { domain: match[1].replace(/^www\./, ''), path: `/${segments.join('/')}` };
}

const commands = {
	async balance() {
		const [user] = await api('/appendix/user_data');
		if (dumpJson(user)) return;
		console.table({ login: user.login, balance: user.money?.balance, total: user.money?.total });
	},

	/**
	 * Monthly search volume, keyword difficulty (0–100) and dominant search intent for every
	 * category and navigational term, in one request.
	 */
	async volume() {
		// keywords given on the command line replace the target term list
		const terms = args.length
			? { category: args.map((query) => ({ query })), navigational: [] }
			: await loadTargetTerms();
		const all = [...terms.category, ...terms.navigational];
		const [result] = await api('/dataforseo_labs/google/keyword_overview/live', [
			{ keywords: all.map((term) => term.query), ...target, include_serp_info: false }
		]);
		if (dumpJson(result)) return;

		const byKeyword = new Map((result?.items ?? []).map((item) => [item.keyword, item]));
		const report = (term) => {
			const item = byKeyword.get(term.query);
			return { ...keywordRow(term.query, item), cpc: item?.keyword_info?.cpc?.toFixed(2) ?? '—' };
		};
		const byVolume = (a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0);

		console.log(
			`\n${args.length ? 'Keywords' : 'Category terms'} · location ${target.location_code} · ${target.language_code}`
		);
		console.table(terms.category.map(report).sort(byVolume));
		if (terms.navigational.length) {
			console.log('\nNavigational terms');
			console.table(terms.navigational.map(report).sort(byVolume));
		}
	},

	/**
	 * Live Google organic results for each category term (or `--query`): our position, the
	 * page that ranks, and the domains above us.
	 *
	 * Live SERP endpoints take one task per request, so this makes one request per query.
	 */
	async serp() {
		const terms = options.query ? [{ query: options.query }] : (await loadTargetTerms()).category;
		const depth = Number.parseInt(options.depth, 10);
		const rows = [];
		const raw = [];

		for (const term of terms) {
			const [result] = await api('/serp/google/organic/live/regular', [{ keyword: term.query, ...target, depth }]);
			raw.push(result);
			const organic = (result?.items ?? [])
				.filter((item) => item.type === 'organic')
				.map((item) => ({ position: Number(item.rank_group), site: resolveSite(item) }));
			const ours = organic.find((item) => isOurs(item.site?.domain));
			rows.push({
				query: term.query,
				position: ours?.position ?? `>${depth}`,
				'our page': ours?.site.path ?? '—',
				'intended page': term.landingPage ?? '—',
				'top 3': organic
					.slice(0, 3)
					.map((item) => item.site?.domain ?? '(no site shown)')
					.join(', ')
			});
		}
		if (dumpJson(raw)) return;

		const ranking = rows.filter((row) => typeof row.position === 'number').length;
		console.log(`\nGoogle organic · location ${target.location_code} · ${target.language_code} · depth ${depth}`);
		console.log(`${OUR_DOMAIN} ranks in the top ${depth} for ${ranking} of ${rows.length} queries`);
		console.table(rows);
	},

	/**
	 * Keywords a domain ranks for, highest search volume first. Run it for a competitor and for
	 * tradingstrategy.ai to find the keyword gap.
	 */
	async ranked() {
		const domain = args[0] ?? OUR_DOMAIN;
		// Labs filter syntax: [condition, 'or', condition, …]
		const filters = (options.match ?? [])
			.map((word) => ['keyword_data.keyword', 'like', `%${word}%`])
			.flatMap((condition, i) => (i ? ['or', condition] : [condition]));
		const [result] = await api('/dataforseo_labs/google/ranked_keywords/live', [
			{
				target: domain,
				...target,
				limit: Number.parseInt(options.limit, 10),
				order_by: ['keyword_data.keyword_info.search_volume,desc'],
				...(filters.length ? { filters } : {})
			}
		]);
		if (dumpJson(result)) return;

		console.log(`\n${domain} · ranked keywords · location ${target.location_code} · ${target.language_code}`);
		console.log(`${result?.total_count ?? 0} keywords in total, showing ${result?.items?.length ?? 0}`);
		console.table(
			(result?.items ?? []).map((item) => {
				const serpItem = item.ranked_serp_element?.serp_item;
				return {
					...keywordRow(item.keyword_data?.keyword, item.keyword_data),
					position: serpItem?.rank_group ?? '—',
					page: serpItem?.url ? new URL(serpItem.url).pathname : '—'
				};
			})
		);
	},

	/**
	 * Keyword suggestions containing each seed phrase, merged and sorted by search volume.
	 * Use it to find higher-volume wording for the target term list.
	 */
	async ideas() {
		if (!args.length) throw new Error('ideas requires one or more seed phrases');
		const byKeyword = new Map();
		const raw = [];
		for (const seed of args) {
			const [result] = await api('/dataforseo_labs/google/keyword_suggestions/live', [
				{
					keyword: seed,
					...target,
					include_seed_keyword: true,
					limit: Number.parseInt(options.limit, 10),
					order_by: ['keyword_info.search_volume,desc']
				}
			]);
			raw.push(result);
			for (const item of [
				result?.seed_keyword_data && { keyword: seed, ...result.seed_keyword_data },
				...(result?.items ?? [])
			]) {
				if (item && !byKeyword.has(item.keyword))
					byKeyword.set(item.keyword, { ...keywordRow(item.keyword, item), seed });
			}
		}
		if (dumpJson(raw)) return;

		const rows = [...byKeyword.values()].sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0));
		console.log(`\nKeyword suggestions · location ${target.location_code} · ${target.language_code}`);
		console.table(rows);
	}
};

if (!command || !(command in commands)) {
	console.error(`Usage: seo-dataforseo.mjs <${Object.keys(commands).join('|')}> [options]`);
	process.exit(1);
}

try {
	await commands[command]();
	if (!options.json && spent > 0) console.log(`\nCost: $${spent.toFixed(4)}`);
} catch (error) {
	console.error(`DataForSEO request failed: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
}
