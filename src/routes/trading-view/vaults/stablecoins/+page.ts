import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { getNormalizedDenomination, isBlacklisted } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getChain } from '$lib/helpers/chain.js';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	const stablecoins = topVaults.vaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		if (isBlacklisted(vault) || !vault.stablecoinish) return acc;

		const denomination = getNormalizedDenomination(vault);

		acc[denomination] ??= {
			slug: denomination,
			name: denomination,
			vault_count: 0,
			tvl: 0
		};
		acc[denomination].vault_count++;
		acc[denomination].tvl += vault.current_nav ?? 0;
		return acc;
	}, {});

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		stablecoins: Object.values(stablecoins),
		options
	};
}
