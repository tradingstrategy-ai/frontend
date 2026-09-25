/**
 * Classify tradingstrategy.ai URLs by page template for Search Console reporting.
 *
 * Search Console reports by URL; SEO changes land per template (all protocol hubs, all vault
 * detail pages …), so `seo-search-console.mjs templates` sums rows by the template returned here.
 * Order matters: the first matching rule wins.
 */

/** Vault listing and tool routes directly under `/vaults/` that are not vault detail pages. */
const VAULT_LISTINGS =
	/^\/vaults\/(all|high-tvl|new-vaults|negative|whitelisted|blacklisted|funds|international|core3-ratings|xerberus-ratings|compare|datasets|api|sitemap\.xml|tokenised-funds|treasury-benchmark|coinbase-candles|yield-[a-z-]+|current-peak-tvl|core3-risk|historical-tvl-[a-z-]+|cumulative-tvl-apy|stablecoin-chain-heatmap)$/;

/** @type {[template: string, pattern: RegExp][]} */
const TEMPLATES = [
	['home', /^\/$/],
	['vaults index', /^\/vaults$/],
	['vault hub index', /^\/vaults\/(chains|protocols|stablecoins|curators|strategies|categories)$/],
	['vault chain hub', /^\/vaults\/chains\/[^/]+$/],
	['vault protocol hub', /^\/vaults\/protocols\/[^/]+$/],
	['vault stablecoin hub', /^\/vaults\/stablecoins\/[^/]+$/],
	['vault curator hub', /^\/vaults\/curators\/[^/]+$/],
	['vault strategy hub', /^\/vaults\/(strategies|categories)\/[^/]+$/],
	['vault listing or tool', VAULT_LISTINGS],
	['vault detail', /^\/vaults\/[^/]+$/],
	['vault other', /^\/vaults\//],
	['strategy', /^\/strategies\/[^/]+/],
	['strategies index', /^\/strategies$/],
	['token', /^\/trading-view\/[^/]+\/tokens\/[^/]+$/],
	['glossary', /^\/glossary(\/|$)/],
	['blog', /^\/blog(\/|$)/],
	['docs', /^\/docs/],
	['trading view', /^\/trading-view(\/|$)/]
];

/**
 * Template name for a Search Console page URL (absolute or path).
 *
 * Query strings and fragments are ignored; unmatched URLs return `other`.
 *
 * @param {string} url page URL as returned by the Search Analytics API
 * @returns {string}
 */
export function getPageTemplate(url) {
	let path;
	try {
		path = new URL(url, 'https://tradingstrategy.ai').pathname;
	} catch {
		return 'other';
	}
	path = path.length > 1 ? path.replace(/\/+$/, '') : path;
	for (const [template, pattern] of TEMPLATES) {
		if (pattern.test(path)) return template;
	}
	return 'other';
}

/**
 * Sum Search Analytics rows by template.
 *
 * Position is impression-weighted, the way Search Console aggregates it.
 *
 * @param {{ keys: string[], clicks: number, impressions: number, position: number }[]} rows rows whose first key is the page
 * @returns {Map<string, { pages: number, clicks: number, impressions: number, ctr: number, position: number }>}
 */
export function summariseByTemplate(rows) {
	/** @type {Map<string, { pages: Set<string>, clicks: number, impressions: number, weightedPosition: number }>} */
	const groups = new Map();
	for (const row of rows) {
		const template = getPageTemplate(row.keys[0]);
		const group = groups.get(template) ?? { pages: new Set(), clicks: 0, impressions: 0, weightedPosition: 0 };
		group.pages.add(row.keys[0]);
		group.clicks += row.clicks;
		group.impressions += row.impressions;
		group.weightedPosition += row.position * row.impressions;
		groups.set(template, group);
	}

	return new Map(
		[...groups].map(([template, group]) => [
			template,
			{
				pages: group.pages.size,
				clicks: group.clicks,
				impressions: group.impressions,
				ctr: group.impressions ? group.clicks / group.impressions : 0,
				position: group.impressions ? group.weightedPosition / group.impressions : 0
			}
		])
	);
}
