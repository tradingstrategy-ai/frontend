import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	calculateTvlWeightedApy,
	getProtocolDisplayName,
	isBlacklisted,
	meetsMinTvl
} from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
import type { MarketShareChartItem } from '../market-share-pie';

export async function load({ fetch, url: { searchParams } }) {
	const { vaults } = await getCachedTopVaults(fetch);

	const eligibleVaults = vaults.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));

	const protocols = eligibleVaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		const slug = vault.protocol_slug;

		acc[slug] ??= {
			slug,
			name: getProtocolDisplayName(vault.protocol),
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

	const chartProtocols: MarketShareChartItem[] = protocolGroups.map((group) => ({
		slug: group.slug,
		label: group.name,
		name: group.name,
		tvl: group.tvl,
		avgApy: group.avg_apy ?? null,
		logoUrl: getVaultProtocolLogoUrl(group.slug),
		href: `/trading-view/vaults/protocols/${group.slug}`
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		protocols: protocolGroups,
		chartProtocols,
		options
	};
}
