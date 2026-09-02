import type { VaultInfo } from '$lib/top-vaults/schemas';

type VaultUpdate = Pick<VaultInfo, 'chain_id' | 'last_updated_at' | 'last_updated_block'>;

/**
 * Calculate the values displayed by the chain summary without returning vault records to the browser.
 *
 * @param vaults Complete server-side vault collection
 * @param chainIds Chain IDs represented by the route slug
 */
export function summariseChainVaults(vaults: readonly VaultUpdate[], chainIds: ReadonlySet<number>) {
	let count = 0;
	let lastUpdatedBlock: number | undefined;
	let lastUpdatedAt: string | undefined;
	let lastUpdatedTimestamp = -Infinity;

	for (const vault of vaults) {
		if (!chainIds.has(vault.chain_id)) continue;

		count++;
		lastUpdatedBlock = Math.max(lastUpdatedBlock ?? 0, vault.last_updated_block);

		const timestamp = Date.parse(vault.last_updated_at);
		if (timestamp > lastUpdatedTimestamp) {
			lastUpdatedAt = vault.last_updated_at;
			lastUpdatedTimestamp = timestamp;
		}
	}

	return { count, lastUpdatedBlock, lastUpdatedAt };
}
