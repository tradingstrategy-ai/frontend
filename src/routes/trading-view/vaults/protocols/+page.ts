import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { calculateTvlWeightedApy, isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	const eligibleVaults = topVaults.vaults.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));

	const protocols = eligibleVaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		const slug = vault.protocol_slug;

		acc[slug] ??= {
			slug,
			name: vault.protocol,
			vault_count: 0,
			tvl: 0,
			avg_apy: null,
			risk: vault.risk,
			risk_numeric: vault.risk_numeric
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		return acc;
	}, {});

	// Calculate TVL-weighted average APY for each protocol
	const protocolGroups: VaultGroup[] = Object.values(protocols).map((group) => ({
		...group,
		avg_apy: calculateTvlWeightedApy(eligibleVaults.filter((v) => v.protocol_slug === group.slug))
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		protocols: protocolGroups,
		options
	};
}
