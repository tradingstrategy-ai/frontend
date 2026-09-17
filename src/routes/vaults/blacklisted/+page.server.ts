import { loadVaultListing } from '$lib/server/top-vaults/listing';

export async function load({ fetch, url }) {
	return {
		// a list of vaults we advise against is not a search target
		robots: 'noindex,follow',
		...(await loadVaultListing(fetch, url, 'blacklisted'))
	};
}
