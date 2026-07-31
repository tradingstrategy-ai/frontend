import { loadVaultListing } from '$lib/server/top-vaults/listing';

export async function load({ fetch, url }) {
	return loadVaultListing(fetch, url, 'blacklisted');
}
