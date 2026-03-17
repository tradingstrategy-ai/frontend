import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { calculateTvlWeightedApy, isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { getStablecoinLogoUrl } from '$lib/stablecoin-metadata/helpers.js';
import type { MarketShareChartItem } from '../market-share-pie';

export async function load({ fetch, url: { searchParams } }) {
	const [{ vaults }, metadataIndex] = await Promise.all([
		getCachedTopVaults(fetch),
		fetchStablecoinMetadataIndex(fetch)
	]);

	const eligibleVaults = vaults.filter((v) => !isBlacklisted(v) && v.stablecoinish && meetsMinTvl(v));

	const metadataBySlug = new Map(metadataIndex.map((m) => [m.slug, m]));

	const stablecoins = eligibleVaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		const slug = vault.denomination_slug;

		acc[slug] ??= {
			slug,
			name: vault.normalised_denomination,
			fullName: metadataBySlug.get(slug)?.name,
			vault_count: 0,
			tvl: 0,
			avg_apy: null
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		return acc;
	}, {});

	// Include stablecoins from metadata index that have no vaults
	for (const meta of metadataIndex) {
		if (!stablecoins[meta.slug]) {
			stablecoins[meta.slug] = {
				slug: meta.slug,
				name: meta.symbol,
				fullName: meta.name,
				vault_count: 0,
				tvl: 0,
				avg_apy: null
			};
		}
	}

	// Calculate TVL-weighted average APY for each stablecoin denomination
	const stablecoinGroups: VaultGroup[] = Object.values(stablecoins).map((group) => ({
		...group,
		avg_apy: calculateTvlWeightedApy(eligibleVaults.filter((v) => v.denomination_slug === group.slug))
	}));

	const chartStablecoins: MarketShareChartItem[] = stablecoinGroups.map((group) => ({
		slug: group.slug,
		label: metadataBySlug.get(group.slug)?.symbol ?? group.name,
		name: group.fullName ?? group.name,
		tvl: group.tvl,
		avgApy: group.avg_apy ?? null,
		logoUrl: getStablecoinLogoUrl(group.slug),
		href: `/trading-view/vaults/stablecoins/${group.slug}`
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		stablecoins: stablecoinGroups,
		chartStablecoins,
		options
	};
}
