/**
 * Loads and aggregates vault data grouped by blockchain.
 * Used by the chains listing page at /trading-view/vaults/chains
 */
import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { isBlacklisted, minTvl } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getChain } from '$lib/helpers/chain';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	const chains = topVaults.vaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		// Filter out blacklisted and small vaults
		if (isBlacklisted(vault) || (vault.current_nav ?? 0) < minTvl) return acc;

		const chain = getChain(vault.chain_id);
		if (!chain) return acc;

		const slug = chain.slug;

		acc[slug] ??= {
			slug,
			name: chain.name,
			vault_count: 0,
			tvl: 0
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;
		return acc;
	}, {});

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		chains: Object.values(chains),
		options
	};
}
