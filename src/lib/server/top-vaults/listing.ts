import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { buildStablecoinMetadataLookup, findStablecoinMetadata } from '$lib/stablecoin-metadata/helpers';
import { fetchLatestTreasuryRate } from '$lib/reference-rates';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	getCurrencyUsdRates,
	getVaultCurrentTvlUsd,
	getVaultDenominationCurrency,
	isNonUsdDenominatedVault,
	withVaultDenominationTokenRate
} from '$lib/top-vaults/helpers';
import {
	filterVaultListingScope,
	getVaultListingDefinition,
	getVaultListingDefaults,
	type VaultListingKey
} from '$lib/top-vaults/listing/definitions';
import { queryVaultListing } from '$lib/top-vaults/listing/query';
import type { VaultListingOptions, VaultListingQuery } from '$lib/top-vaults/listing/query';
import { parseVaultListingQuery } from '$lib/top-vaults/listing/state';
import { INITIAL_VAULT_LISTING_LIMIT } from '$lib/top-vaults/listing/types';
import type { VaultInfo } from '$lib/top-vaults/schemas';

async function resolveListingVaults(fetchFn: typeof fetch, vaults: VaultInfo[], key: VaultListingKey, scope?: string) {
	if (key !== 'international') return filterVaultListingScope(vaults, key, scope);

	const metadata = await fetchStablecoinMetadataIndex(fetchFn);
	const lookup = buildStablecoinMetadataLookup(metadata);
	const rates = getCurrencyUsdRates(metadata);
	return vaults
		.map((vault) =>
			withVaultDenominationTokenRate(
				vault,
				findStablecoinMetadata(lookup, vault.denomination_slug, vault.denomination, vault.normalised_denomination),
				rates
			)
		)
		.filter((vault) => isNonUsdDenominatedVault(vault) && getVaultCurrentTvlUsd(vault) != null);
}

/** Add the cached Treasury rate only when the active server-side filter needs it. */
async function getListingOptions(options: VaultListingOptions, query: VaultListingQuery): Promise<VaultListingOptions> {
	if (query.mr !== 'treasury') return options;
	return { ...options, treasuryRate: await fetchLatestTreasuryRate().catch(() => null) };
}

/**
 * Build an SSR-safe first listing page from the complete server-cached export.
 * The returned rows have already passed the definition scope, filters, and
 * deterministic shared sort order.
 */
export async function loadVaultListing(fetchFn: typeof fetch, url: URL, key: VaultListingKey, scope?: string) {
	const definition = getVaultListingDefinition(key);
	const topVaults = await getCachedTopVaults(fetchFn);
	const scopedVaults = await resolveListingVaults(fetchFn, topVaults.vaults, key, scope);
	const query = parseVaultListingQuery(url.searchParams, getVaultListingDefaults(key, scope));
	const listing = queryVaultListing(scopedVaults, query, await getListingOptions(definition.options, query));
	const initialVaults = listing.vaults.slice(0, INITIAL_VAULT_LISTING_LIMIT);

	return {
		totalVaultCount: topVaults.vaults.length,
		// Listing pages render the row data directly. The complete curator and
		// CORE3 registries are needed by their own detail components, not by the
		// table, and can be several megabytes of unrelated page data.
		initialTopVaults: {
			generated_at: topVaults.generated_at,
			vaults: initialVaults,
			core3_protocols: {},
			curators: {}
		},
		initialVaultListingHasMore: initialVaults.length < listing.vaults.length,
		listingSummary: {
			matchingCount: listing.vaults.length,
			hiddenByTvl: listing.hiddenByTvl,
			hiddenBlacklistedCount: listing.hiddenBlacklistedCount,
			hiddenVaultNames: listing.hiddenVaults.slice(0, 2).map((vault) => vault.name),
			totalTvl: listing.totalTvl,
			avgTvlWeightedApy1M: listing.avgTvlWeightedApy1M
		},
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

/** Resolve a listing request for the continuation endpoint. */
export async function loadVaultListingContinuation(
	fetchFn: typeof fetch,
	url: URL,
	key: VaultListingKey,
	scope?: string
) {
	const definition = getVaultListingDefinition(key);
	const topVaults = await getCachedTopVaults(fetchFn);
	const scopedVaults = await resolveListingVaults(fetchFn, topVaults.vaults, key, scope);
	const query = parseVaultListingQuery(url.searchParams, getVaultListingDefaults(key, scope));
	return {
		topVaults,
		listing: queryVaultListing(scopedVaults, query, await getListingOptions(definition.options, query))
	};
}
