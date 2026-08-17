import { json, error } from '@sveltejs/kit';
import { getVaultListingDefinition, isVaultListingKey } from '$lib/top-vaults/listing/definitions';
import { loadVaultListingContinuation } from '$lib/server/top-vaults/listing';
import { VAULT_LISTING_PAGE_SIZE } from '$lib/top-vaults/listing/types';
import { isBlacklisted } from '$lib/top-vaults/helpers';

/** Return one globally sorted vault-listing continuation page. */
export async function GET({ fetch, url }) {
	const offset = Number(url.searchParams.get('offset') ?? '0');
	if (!Number.isInteger(offset) || offset < 0) error(400, 'Invalid vault listing offset');
	const listingKey = url.searchParams.get('listing') ?? 'top';
	if (!isVaultListingKey(listingKey)) error(400, 'Unknown vault listing');
	const scope = url.searchParams.get('scope') ?? undefined;
	if (getVaultListingDefinition(listingKey).requiresScope && !scope) error(400, 'Vault listing scope is required');
	const { topVaults, listing } = await loadVaultListingContinuation(fetch, url, listingKey, scope);
	const expectedVersion = url.searchParams.get('version');
	const generatedAt = new Date(topVaults.generated_at).toISOString();
	if (expectedVersion && expectedVersion !== generatedAt) {
		return json(
			{ message: 'Vault listing data has changed' },
			{ status: 409, headers: { 'Cache-Control': 'private, no-store' } }
		);
	}
	const onlyBlacklisted = url.searchParams.get('blacklisted') === '1';
	const matchingVaults = onlyBlacklisted ? listing.vaults.filter(isBlacklisted) : listing.vaults;
	const vaults = matchingVaults.slice(offset, offset + VAULT_LISTING_PAGE_SIZE);
	return json(
		{
			vaults,
			nextOffset: offset + vaults.length,
			hasMore: offset + vaults.length < matchingVaults.length,
			generatedAt,
			listingSummary: {
				matchingCount: listing.vaults.length,
				hiddenByTvl: listing.hiddenByTvl,
				hiddenBlacklistedCount: listing.hiddenBlacklistedCount,
				hiddenVaultNames: listing.hiddenVaults.slice(0, 2).map((vault) => vault.name),
				totalTvl: listing.totalTvl,
				avgTvlWeightedApy1M: listing.avgTvlWeightedApy1M
			}
		},
		{ headers: { 'Cache-Control': 'private, no-store' } }
	);
}
