import type { TopVaults, VaultInfo } from './schemas';

/**
 * Maximum number of vault records included in a listing route's initial HTML.
 *
 * Small, pre-filtered groups render immediately with their server data. Larger
 * listings keep using the shared client-side export to avoid inflating the page
 * response with hundreds or thousands of full vault records.
 */
export const INLINE_VAULT_COUNT_LIMIT = 100;

/**
 * Create an initial payload for a small, pre-filtered vault listing.
 *
 * @param topVaults - Complete, server-cached vault dataset
 * @param vaults - Records belonging to the current listing
 */
export function getInlineVaultListing(topVaults: TopVaults, vaults: VaultInfo[]): TopVaults | undefined {
	if (vaults.length >= INLINE_VAULT_COUNT_LIMIT) return undefined;

	return { ...topVaults, vaults };
}
