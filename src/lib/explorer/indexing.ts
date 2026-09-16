/**
 * Decide whether a token or trading-pair detail page should be indexable by search engines.
 *
 * The explorer has a page for every token and pair the backend has ever seen, including
 * thousands of dead or spam tokens with no liquidity and no trades. Search engines were
 * ranking those pages for their (often adult / gambling) token names, which defined the
 * site's search footprint and wasted crawl budget. Pages below the thresholds here get a
 * `noindex,follow` robots meta tag; they stay live and linked for users.
 *
 * Missing data is not treated as low quality: when every metric is `null`/`undefined` the
 * page stays indexable. Only a confirmed number below threshold excludes a page.
 *
 * Independently of the metrics, tokens and pairs whose names contain adult or gambling
 * terms are never indexed: a handful of them have real liquidity, and ranking for those
 * names is not the search footprint we want.
 */

import { isNumber } from '$lib/helpers/formatters';

/** Minimum USD liquidity / TVL for a token or pair page to be indexed. */
export const INDEXABLE_MIN_LIQUIDITY_USD = 5_000;

/** Minimum USD trading volume (24h for tokens, 30d for pairs) for a page to be indexed. */
export const INDEXABLE_MIN_VOLUME_USD = 1_000;

/**
 * Name fragments that keep a page out of the index regardless of liquidity.
 *
 * Substring matches are for terms that never appear innocently ("porn", "xxx"). Terms that
 * occur inside legitimate names are word-start bounded ("Essex", "Peacock") or whole-word
 * bounded ("Alphabet", "analysis", "slotted"). The list is English-only by design;
 * obfuscated or non-Latin names are out of scope.
 */
export const NOINDEX_NAME_PATTERN =
	/porn|xxx|nude|fuck|pussy|boob|tits|milf|hentai|bokep|xhamster|xnxx|brazzers|onlyfans|casino|poker|jackpot|lottery|gacor|togel|\b(?:sex|cock)|\b(?:slot|bet|cum|anal)\b/;

export type TokenIndexingMetrics = {
	liquidity_latest?: MaybeNumber;
	tvl_latest?: MaybeNumber;
	volume_24h?: MaybeNumber;
	name?: string | null;
	symbol?: string | null;
};

export type PairIndexingMetrics = {
	pair_tvl?: MaybeNumber;
	usd_liquidity_latest?: MaybeNumber;
	usd_volume_30d?: MaybeNumber;
	pair_symbol?: string | null;
	pair_name?: string | null;
	base_token_symbol?: string | null;
};

/**
 * Does any of the display names contain a blocklisted term?
 *
 * Names are lower-cased, stripped of diacritics (NFKD) and have `-`, `_` and `/` turned into
 * spaces so hyphenated pair symbols such as `PORNHUB-ETH` match the word-bounded terms too.
 *
 * @param names token / pair display names; `null` and `undefined` entries are skipped
 */
export function hasBlockedName(names: (string | null | undefined)[]): boolean {
	return names.some((name) => {
		if (!name) return false;
		const normalised = name
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[-_/]+/g, ' ');
		return NOINDEX_NAME_PATTERN.test(normalised);
	});
}

/**
 * Shared rule: indexable when any known metric clears its threshold, or when no metric is known.
 *
 * @param liquidity USD liquidity/TVL candidates
 * @param volume USD volume candidate
 */
function isIndexable(liquidity: MaybeNumber[], volume: MaybeNumber): boolean {
	const knownLiquidity = liquidity.filter(isNumber);
	if (knownLiquidity.length === 0 && !isNumber(volume)) return true;

	return (
		knownLiquidity.some((value) => value >= INDEXABLE_MIN_LIQUIDITY_USD) ||
		(isNumber(volume) && volume >= INDEXABLE_MIN_VOLUME_USD)
	);
}

/**
 * Should the token detail page for this token be indexed?
 *
 * @param token `token/details` API response (only the name and liquidity/volume fields are read)
 */
export function isTokenIndexable(token: TokenIndexingMetrics): boolean {
	if (hasBlockedName([token.name, token.symbol])) return false;
	return isIndexable([token.liquidity_latest, token.tvl_latest], token.volume_24h);
}

/**
 * Should the pair detail page for this trading pair be indexed?
 *
 * @param summary `pair-details` API `summary` object (only the name and TVL/liquidity/volume fields are read)
 */
export function isPairIndexable(summary: PairIndexingMetrics): boolean {
	if (hasBlockedName([summary.pair_symbol, summary.pair_name, summary.base_token_symbol])) return false;
	return isIndexable([summary.pair_tvl, summary.usd_liquidity_latest], summary.usd_volume_30d);
}
