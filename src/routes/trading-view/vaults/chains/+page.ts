import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { isBlacklisted } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getChain } from '$lib/helpers/chain';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	type ChainAccumulator = VaultGroup & { weighted_apy_sum: number; tvl_with_apy: number };

	const chains = topVaults.vaults.reduce<Record<string, ChainAccumulator>>((acc, vault) => {
		if (isBlacklisted(vault)) return acc;

		const chain = getChain(vault.chain_id);
		if (!chain) return acc;

		const slug = chain.slug;

		acc[slug] ??= {
			slug,
			name: chain.name,
			vault_count: 0,
			tvl: 0,
			avg_apy: null,
			weighted_apy_sum: 0,
			tvl_with_apy: 0
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		// Accumulate for TVL-weighted average APY calculation
		if (vault.one_month_cagr != null && vault.current_nav != null && vault.current_nav > 0) {
			acc[slug].weighted_apy_sum += vault.one_month_cagr * vault.current_nav;
			acc[slug].tvl_with_apy += vault.current_nav;
		}

		return acc;
	}, {});

	// Calculate final TVL-weighted average APY and remove accumulator fields
	const chainGroups: VaultGroup[] = Object.values(chains).map(({ weighted_apy_sum, tvl_with_apy, ...group }) => ({
		...group,
		avg_apy: tvl_with_apy > 0 ? weighted_apy_sum / tvl_with_apy : null
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
