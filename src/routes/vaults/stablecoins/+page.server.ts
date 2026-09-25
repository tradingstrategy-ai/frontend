import type { VaultGroup, VaultInfo } from '$lib/top-vaults/schemas.js';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { calculateTvlWeightedApy, isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';
import { getStablecoinYieldComparison } from '$lib/top-vaults/listing/stablecoin-yields';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import {
	buildStablecoinMetadataLookup,
	getStablecoinCoingeckoLink,
	getStablecoinDetailsHref,
	getStablecoinLogoUrl,
	resolveStablecoinSlug
} from '$lib/stablecoin-metadata/helpers.js';
import type { MarketShareChartItem } from '../market-share-pie';
import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas.js';

function getStablecoinRateFields(metadata: StablecoinMetadata | undefined) {
	return {
		usd_rate: metadata?.usd_rate ?? null,
		usd_rate_updated_at: metadata?.usd_rate_updated_at ?? null,
		usd_rate_fetched_at: metadata?.usd_rate_fetched_at ?? null,
		peg_rate: metadata?.peg_rate ?? null,
		peg_rate_currency: metadata?.peg_rate_currency ?? null,
		depegged_at: metadata?.depegged_at ?? null,
		coingecko_link: getStablecoinCoingeckoLink(metadata) ?? null
	};
}

function getVaultStablecoinRateFields(vault: VaultInfo) {
	const rate = vault.denomination_token_rate;

	return {
		usd_rate: rate?.usd_rate ?? null,
		usd_rate_updated_at: null,
		usd_rate_fetched_at: rate?.usd_rate_fetched_at ?? null,
		peg_rate: rate?.native_rate ?? rate?.usd_rate ?? null,
		peg_rate_currency: rate?.native_rate_currency ?? (rate?.usd_rate != null ? 'usd' : null),
		depegged_at: null,
		denomination_token_rate: rate ?? null,
		coingecko_link: null
	};
}

export async function load({ fetch, url: { searchParams } }) {
	const [{ vaults, generated_at }, metadataIndex] = await Promise.all([
		getCachedTopVaults(fetch),
		fetchStablecoinMetadataIndex(fetch)
	]);

	const eligibleVaults = vaults.filter((v) => !isBlacklisted(v) && v.stablecoinish && meetsMinTvl(v));

	const metadataLookup = buildStablecoinMetadataLookup(metadataIndex);
	const metadataBySlug = new Map(metadataIndex.map((m) => [m.slug, m]));

	const resolveSlug = (vault: VaultInfo) =>
		resolveStablecoinSlug(
			{
				slug: vault.denomination_slug,
				symbol: vault.denomination,
				name: vault.normalised_denomination
			},
			metadataLookup
		) ?? vault.denomination_slug;

	const stablecoins = eligibleVaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		const slug = resolveSlug(vault);
		const metadata = metadataBySlug.get(slug);

		acc[slug] ??= {
			slug,
			name: vault.normalised_denomination,
			fullName: metadata?.name,
			vault_count: 0,
			tvl: 0,
			avg_apy: null,
			...(metadata ? getStablecoinRateFields(metadata) : getVaultStablecoinRateFields(vault))
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
				avg_apy: null,
				...getStablecoinRateFields(meta)
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
		label: metadataBySlug.get(group.slug)?.name ?? group.fullName ?? group.name,
		name: group.fullName ?? group.name,
		tvl: group.tvl,
		avgApy: group.avg_apy ?? null,
		logoUrl: getStablecoinLogoUrl(group.slug),
		href: getStablecoinDetailsHref(group.slug)
	}));

	// "best stablecoin yield" comparison: the leading vault of each of the largest stablecoins by
	// USD TVL, chosen with the same rules as the hub insights
	const yieldComparison = getStablecoinYieldComparison(eligibleVaults, {
		resolveSlug,
		getName: (slug) => metadataBySlug.get(slug)?.name
	});

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		stablecoins: stablecoinGroups,
		chartStablecoins,
		yieldComparison,
		generatedAt: generated_at,
		options
	};
}
