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
 */

import { isNumber } from '$lib/helpers/formatters';

/** Minimum USD liquidity / TVL for a token or pair page to be indexed. */
export const INDEXABLE_MIN_LIQUIDITY_USD = 5_000;

/** Minimum USD trading volume (24h for tokens, 30d for pairs) for a page to be indexed. */
export const INDEXABLE_MIN_VOLUME_USD = 1_000;

export type TokenIndexingMetrics = {
	liquidity_latest?: MaybeNumber;
	tvl_latest?: MaybeNumber;
	volume_24h?: MaybeNumber;
};

export type PairIndexingMetrics = {
	pair_tvl?: MaybeNumber;
	usd_liquidity_latest?: MaybeNumber;
	usd_volume_30d?: MaybeNumber;
};

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
 * @param token `token/details` API response (only the liquidity/volume fields are read)
 */
export function isTokenIndexable(token: TokenIndexingMetrics): boolean {
	return isIndexable([token.liquidity_latest, token.tvl_latest], token.volume_24h);
}

/**
 * Should the pair detail page for this trading pair be indexed?
 *
 * @param summary `pair-details` API `summary` object (only the TVL/liquidity/volume fields are read)
 */
export function isPairIndexable(summary: PairIndexingMetrics): boolean {
	return isIndexable([summary.pair_tvl, summary.usd_liquidity_latest], summary.usd_volume_30d);
}
