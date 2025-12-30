import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { isBlacklisted } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	const stablecoins = topVaults.vaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		if (isBlacklisted(vault) || !vault.stablecoinish) return acc;

		const slug = vault.denomination_slug;

		if (vault.vault_slug == 'savings-infinifi-usd') {
			console.log(vault);
		}

		acc[slug] ??= {
			slug: slug,
			name: vault.normalised_denomination,
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
		stablecoins: Object.values(stablecoins),
		options
	};
}
