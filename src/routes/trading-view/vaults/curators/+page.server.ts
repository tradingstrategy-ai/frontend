import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { calculateTvlWeightedApy, isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import type { MarketShareChartItem } from '../market-share-pie';

export async function load({ fetch, url: { searchParams } }) {
	const { vaults, curators } = await getCachedTopVaults(fetch);

	const eligibleVaults = vaults.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));

	const groups = eligibleVaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		const slug = vault.curator_slug;
		if (!slug) return acc;

		acc[slug] ??= {
			slug,
			name: curators[slug]?.name ?? vault.curator_name ?? slug,
			vault_count: 0,
			tvl: 0,
			avg_apy: null
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		return acc;
	}, {});

	// Calculate TVL-weighted average APY for each curator group
	const curatorGroups: VaultGroup[] = Object.values(groups).map((group) => ({
		...group,
		avg_apy: calculateTvlWeightedApy(eligibleVaults.filter((v) => v.curator_slug === group.slug))
	}));

	// Curator logos are absolute URLs embedded in the dataset; pass a slug → URL
	// map to the client so the table and chart can render them.
	const curatorLogos: Record<string, string> = {};
	for (const group of curatorGroups) {
		const logoUrl = curators[group.slug]?.logos.generic;
		if (logoUrl) curatorLogos[group.slug] = logoUrl;
	}

	const chartCurators: MarketShareChartItem[] = curatorGroups.map((group) => ({
		slug: group.slug,
		label: group.name,
		name: group.name,
		tvl: group.tvl,
		avgApy: group.avg_apy ?? null,
		logoUrl: curatorLogos[group.slug],
		href: `/trading-view/vaults/curators/${group.slug}`
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		curators: curatorGroups,
		curatorLogos,
		chartCurators,
		options
	};
}
