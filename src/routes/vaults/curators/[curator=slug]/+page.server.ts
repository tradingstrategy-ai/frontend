import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { loadVaultListing } from '$lib/server/top-vaults/listing';

export async function load({ params, fetch, url }) {
	const { curator } = params;
	const { curators } = await getCachedTopVaults(fetch);

	const curatorInfo = curators[curator];
	if (!curatorInfo) error(404, 'Curator not found');

	const [stablecoin, btc, eth] = await Promise.all([
		loadVaultListing(fetch, url, 'curator', curator),
		loadVaultListing(fetch, url, 'curator-btc', curator),
		loadVaultListing(fetch, url, 'curator-eth', curator)
	]);

	return {
		curatorSlug: curator,
		curatorName: curatorInfo.name,
		curator: curatorInfo,
		...stablecoin,
		cryptoListings: [btc, eth].filter((listing) => listing.totalVaultCount > 0)
	};
}
