/**
 * Search-snippet helpers shared by every template: title assembly with the brand suffix
 * and word-boundary truncation of descriptions. See docs/google-webmasters.md.
 */

/** The brand suffix appended to every page title. */
export const SITE_NAME = 'Trading Strategy';

/** Roughly what Google displays before truncating a title. */
export const TITLE_MAX_LENGTH = 60;

/** Roughly what Google displays before truncating a description. */
export const DESCRIPTION_MAX_LENGTH = 155;

/** Absolute `@id` of the site's `Organization` structured-data node. */
export const ORGANIZATION_ID = 'https://tradingstrategy.ai/#organization';

/**
 * Cut a string at the last word boundary before `max`, appending an ellipsis when cut.
 */
export function truncateAtWord(text: string, max: number): string {
	if (text.length <= max) return text;
	const cut = text.slice(0, max - 1);
	const boundary = cut.lastIndexOf(' ');
	return `${(boundary > max / 2 ? cut.slice(0, boundary) : cut).replace(/[\s,.;:—-]+$/, '')}…`;
}

/**
 * Build a page `<title>` from its parts, most specific first, with the brand suffix.
 *
 * Parts are joined with ` | ` and `Trading Strategy` is appended. When the result would
 * exceed `TITLE_MAX_LENGTH`, the least specific parts are dropped from the end (the first
 * part is always kept); the brand suffix is the last thing to go.
 *
 * @param parts title fragments, e.g. `['WETH', 'Ethereum token']`
 * @example getPageTitle(['ETH-USDC', 'Uniswap v3 on Ethereum']) → 'ETH-USDC | Uniswap v3 on Ethereum | Trading Strategy'
 */
export function getPageTitle(parts: (string | null | undefined)[]): string {
	const kept = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
	if (kept.length === 0) return SITE_NAME;

	for (let count = kept.length; count > 0; count--) {
		const candidate = [...kept.slice(0, count), SITE_NAME].join(' | ');
		if (candidate.length <= TITLE_MAX_LENGTH) return candidate;
	}
	return kept[0];
}

/**
 * Meta description from the best available text, cut to `DESCRIPTION_MAX_LENGTH`.
 *
 * @param candidates texts in order of preference; blank ones are skipped
 * @param fallback used when every candidate is blank
 */
export function getMetaDescription(candidates: (string | null | undefined)[], fallback = ''): string {
	const text = candidates.map((candidate) => candidate?.trim()).find(Boolean) ?? fallback;
	return truncateAtWord(text.replace(/\s+/g, ' '), DESCRIPTION_MAX_LENGTH);
}
