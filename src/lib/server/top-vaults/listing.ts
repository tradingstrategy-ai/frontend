import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { buildStablecoinMetadataLookup, findVaultStablecoinMetadata } from '$lib/stablecoin-metadata/helpers';
import { fetchLatestTreasuryRate } from '$lib/reference-rates';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { isVisibleVaultCategory } from '$lib/top-vaults/categories';
import {
	getCurrencyUsdRates,
	getCore3PolForVault,
	getVaultCurrentTvlUsd,
	getVaultDenominationCurrency,
	isNonUsdDenominatedVault,
	toVaultListingRow,
	withVaultDenominationTokenRate
} from '$lib/top-vaults/helpers';
import { getRiskRatedVaults } from '$lib/top-vaults/risk-rating-statistics';
import {
	filterVaultListingScope,
	getCuratorCryptoFamily,
	getVaultListingDefinition,
	getVaultListingDefaults,
	type VaultListingKey
} from '$lib/top-vaults/listing/definitions';
import { queryVaultListing } from '$lib/top-vaults/listing/query';
import type { VaultListingOptions, VaultListingQuery, VaultListingResult } from '$lib/top-vaults/listing/query';
import { getListingSearchParams, parseVaultListingQuery } from '$lib/top-vaults/listing/state';
import { INITIAL_VAULT_LISTING_LIMIT, type VaultListingSummary } from '$lib/top-vaults/listing/types';
import type { TopVaults, VaultInfo } from '$lib/top-vaults/schemas';
import { getCachedCryptoVaults } from './crypto-vaults';

async function resolveListingVaults(fetchFn: typeof fetch, topVaults: TopVaults, key: VaultListingKey, scope?: string) {
	const { vaults } = topVaults;
	if (key === 'category' && (!scope || !isVisibleVaultCategory(scope) || !Object.hasOwn(topVaults.categories, scope))) {
		return [];
	}
	if (key === 'core3-ratings') {
		return getRiskRatedVaults(topVaults, 'core3').map((vault) => {
			const pol = getCore3PolForVault(vault, topVaults.core3_protocols);
			if (!pol) return vault;
			return {
				...vault,
				core3: {
					...vault.core3,
					risk_score: pol.score,
					risk_rating_label: pol.rating,
					confidence: pol.confidence
				}
			};
		});
	}
	if (key === 'xerberus-ratings') return getRiskRatedVaults(topVaults, 'xerberus');
	if (key !== 'international') return filterVaultListingScope(vaults, key, scope);

	const metadata = await fetchStablecoinMetadataIndex(fetchFn);
	const lookup = buildStablecoinMetadataLookup(metadata);
	const rates = getCurrencyUsdRates(metadata);
	return vaults
		.map((vault) => withVaultDenominationTokenRate(vault, findVaultStablecoinMetadata(lookup, vault), rates))
		.filter((vault) => isNonUsdDenominatedVault(vault) && getVaultCurrentTvlUsd(vault) != null);
}

/** Add the cached Treasury rate only when the active server-side filter needs it. */
async function getListingOptions(options: VaultListingOptions, query: VaultListingQuery): Promise<VaultListingOptions> {
	if (query.mr !== 'treasury') return options;
	return { ...options, treasuryRate: await fetchLatestTreasuryRate().catch(() => null) };
}

/**
 * Convert a complete query result into compact listing metadata.
 *
 * @param listing - Complete filtered and sorted query result.
 */
export function createVaultListingSummary(listing: VaultListingResult): VaultListingSummary {
	return {
		matchingCount: listing.vaults.length,
		hiddenByTvl: listing.hiddenByTvl,
		hiddenBlacklistedCount: listing.hiddenBlacklistedCount,
		hiddenVaultNames: listing.hiddenVaults.slice(0, 2).map((vault) => vault.name),
		totalTvl: listing.totalTvl,
		avgTvlWeightedApy1M: listing.avgTvlWeightedApy1M
	};
}

/** Project a row, linking crypto vaults to their venue when no native detail page is available. */
export function projectVaultListingRow(vault: VaultInfo, curators: TopVaults['curators'], key: VaultListingKey) {
	const row = toVaultListingRow(vault, curators);
	if (getCuratorCryptoFamily(key) && vault.link?.startsWith('https://')) row.venue_url = vault.link;
	return row;
}

async function resolveListingSource(fetchFn: typeof fetch, key: VaultListingKey, scope?: string) {
	const topVaults = await getCachedTopVaults(fetchFn);
	const family = getCuratorCryptoFamily(key);
	if (family && scope && Object.hasOwn(topVaults.curators, scope)) {
		const cryptoVaults = await getCachedCryptoVaults(fetchFn);
		return {
			topVaults,
			scopedVaults: cryptoVaults?.curators.get(scope)?.[family] ?? [],
			generatedAt: cryptoVaults?.generatedAt ?? topVaults.generated_at
		};
	}

	return {
		topVaults,
		scopedVaults: await resolveListingVaults(fetchFn, topVaults, key, scope),
		generatedAt: topVaults.generated_at
	};
}

/**
 * Build an SSR-safe first listing page from the complete server-cached export.
 * The returned rows have already passed the definition scope, filters, and
 * deterministic shared sort order.
 *
 * @param fetchFn - SvelteKit server fetch function.
 * @param url - Listing URL containing the active filters and sort.
 * @param key - Fixed listing definition key.
 * @param scope - Optional route scope such as a chain or protocol slug.
 */
export async function loadVaultListing(fetchFn: typeof fetch, url: URL, key: VaultListingKey, scope?: string) {
	const definition = getVaultListingDefinition(key);
	const { topVaults, scopedVaults, generatedAt } = await resolveListingSource(fetchFn, key, scope);
	const family = getCuratorCryptoFamily(key);
	const params = getListingSearchParams(url.searchParams, family ? `${family}-` : '');
	const query = parseVaultListingQuery(params, getVaultListingDefaults(key, scope));
	const listing = queryVaultListing(scopedVaults, query, await getListingOptions(definition.options, query));
	const initialVaults = listing.vaults
		.slice(0, INITIAL_VAULT_LISTING_LIMIT)
		.map((vault) => projectVaultListingRow(vault, topVaults.curators, key));

	return {
		totalVaultCount: family ? scopedVaults.length : topVaults.vaults.length,
		// Listing pages render the row data directly. The complete curator and
		// CORE3 registries are needed by their own detail components, not by the
		// table, and can be several megabytes of unrelated page data.
		initialTopVaults: {
			generated_at: generatedAt,
			vaults: initialVaults,
			core3_protocols: {},
			curators: {},
			categories: {}
		},
		initialHasMore: initialVaults.length < listing.vaults.length,
		listingSummary: createVaultListingSummary(listing),
		listingCurrencies:
			key === 'international'
				? [
						...new Set(
							listing.vaults
								.map(getVaultDenominationCurrency)
								.filter((currency): currency is string => currency != null)
						)
					]
						.map((currency) => currency.toUpperCase())
						.toSorted((a, b) => a.localeCompare(b))
				: undefined,
		listingKey: key,
		listingScope: scope
	};
}

/**
 * Resolve a listing request for the continuation endpoint.
 *
 * @param fetchFn - SvelteKit server fetch function.
 * @param url - Continuation URL containing the active filters and sort.
 * @param key - Fixed listing definition key.
 * @param scope - Optional route scope such as a chain or protocol slug.
 */
export async function loadVaultListingContinuation(
	fetchFn: typeof fetch,
	url: URL,
	key: VaultListingKey,
	scope?: string
) {
	const definition = getVaultListingDefinition(key);
	const { topVaults, scopedVaults, generatedAt } = await resolveListingSource(fetchFn, key, scope);
	const query = parseVaultListingQuery(url.searchParams, getVaultListingDefaults(key, scope));
	return {
		topVaults,
		generatedAt,
		listing: queryVaultListing(scopedVaults, query, await getListingOptions(definition.options, query))
	};
}
