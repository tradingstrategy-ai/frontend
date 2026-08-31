import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { loadVaultListing } from '$lib/server/top-vaults/listing';
import {
	getRiskRatedVaults,
	getRiskRatingStatistics,
	getRiskRatingTvlBands
} from '$lib/top-vaults/risk-rating-statistics';

export async function load({ fetch, url }) {
	const topVaults = await getCachedTopVaults(fetch);
	return {
		...(await loadVaultListing(fetch, url, 'xerberus-ratings')),
		initialRatingStatistics: getRiskRatingStatistics(getRiskRatedVaults(topVaults, 'xerberus')),
		initialRiskRatingTvlBands: getRiskRatingTvlBands(topVaults, 'xerberus')
	};
}
