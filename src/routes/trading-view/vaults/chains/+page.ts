import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { calculateTvlWeightedApy, isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getChain } from '$lib/helpers/chain';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	const eligibleVaults = topVaults.vaults.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));

	const chains = eligibleVaults.reduce<Record<string, VaultGroup & { chain_id: number }>>((acc, vault) => {
		const chain = getChain(vault.chain_id);
		if (!chain) return acc;

		const slug = chain.slug;

		acc[slug] ??= {
			slug,
			name: chain.name,
			vault_count: 0,
			tvl: 0,
			avg_apy: null,
			chain_id: vault.chain_id
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		return acc;
	}, {});

	// Calculate TVL-weighted average APY for each chain
	const chainGroups: VaultGroup[] = Object.values(chains).map(({ chain_id, ...group }) => ({
		...group,
		avg_apy: calculateTvlWeightedApy(eligibleVaults.filter((v) => v.chain_id === chain_id))
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		chains: chainGroups,
		options
	};
}
