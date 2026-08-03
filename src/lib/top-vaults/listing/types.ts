/** Rows included directly in the server-rendered page response. */
export const INITIAL_VAULT_LISTING_LIMIT = 125;

/** Rows returned by each browser continuation request. */
export const VAULT_LISTING_PAGE_SIZE = 50;

/** Full-result values sent with the SSR batch, not repeated by continuations. */
export interface VaultListingSummary {
	matchingCount: number;
	hiddenByTvl: number;
	hiddenVaultNames: string[];
	totalTvl: number;
	avgTvlWeightedApy1M: number | null;
}
