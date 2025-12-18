import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { getDenominationSlug, isBlacklisted } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getChain } from '$lib/helpers/chain.js';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	const stablecoins = topVaults.vaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		if (isBlacklisted(vault) || !vault.stablecoinish) return acc;

		const slug = getDenominationSlug(vault);

		acc[slug] ??= {
			slug,
			name: vault.denomination,
			vault_count: 0,
			tvl: 0,
			chains: new Set()
		};

		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		const chain = getChain(vault.chain_id);
		if (chain) acc[slug].chains.add(chain.slug);

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
