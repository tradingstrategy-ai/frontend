import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { loadVaultListing } from '$lib/server/top-vaults/listing';

export async function load({ params, fetch, url }) {
	const { curator } = params;
	const { curators } = await getCachedTopVaults(fetch);

	const curatorInfo = curators[curator];
	if (!curatorInfo) error(404, 'Curator not found');

	return {
		curatorSlug: curator,
		curatorName: curatorInfo.name,
		curator: curatorInfo,
		// the page's description quotes this listing's summary, so its figures match the table
		...(await loadVaultListing(fetch, url, 'curator', curator))
	};
}
