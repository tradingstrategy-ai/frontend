import { json, error } from '@sveltejs/kit';
import { getVaultListingDefinition, isVaultListingKey } from '$lib/top-vaults/listing/definitions';
import { loadVaultListingContinuation } from '$lib/server/top-vaults/listing';
import { VAULT_LISTING_PAGE_SIZE } from '$lib/top-vaults/listing/types';

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
	const vaults = listing.vaults.slice(offset, offset + VAULT_LISTING_PAGE_SIZE);
	return json(
		{
			vaults,
			nextOffset: offset + vaults.length,
			hasMore: offset + vaults.length < listing.vaults.length,
			generatedAt
		},
		{ headers: { 'Cache-Control': 'private, no-store' } }
	);
}
