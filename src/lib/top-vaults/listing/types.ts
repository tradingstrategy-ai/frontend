/**
 * Rows included directly in the server-rendered page response.
 *
 * Each row is serialised into the HTML twice (table markup and page data), so this
 * number drives listing page weight; `tests/integration/vaults/page-weight.test.ts`
 * enforces the budget.
 */
export const INITIAL_VAULT_LISTING_LIMIT = 75;

/** Rows returned by each browser continuation request. */
export const VAULT_LISTING_PAGE_SIZE = 50;

/** Full-result values sent with SSR batches and listing-data responses. */
export interface VaultListingSummary {
	matchingCount: number;
	hiddenByTvl: number;
	/** Blacklisted vaults omitted from the default safety filter. */
	hiddenBlacklistedCount: number;
	hiddenVaultNames: string[];
	totalTvl: number;
	avgTvlWeightedApy1M: number | null;
}
