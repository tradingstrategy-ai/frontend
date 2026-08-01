import { loadVaultListing } from '$lib/server/top-vaults/listing';

export async function load({ fetch, url }) {
	const result = await loadVaultListing(fetch, url, 'top');

	return result;
}
