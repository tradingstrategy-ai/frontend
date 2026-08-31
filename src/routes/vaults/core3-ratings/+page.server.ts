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
		...(await loadVaultListing(fetch, url, 'core3-ratings')),
		initialRatingStatistics: getRiskRatingStatistics(getRiskRatedVaults(topVaults, 'core3')),
		initialRiskRatingTvlBands: getRiskRatingTvlBands(topVaults, 'core3')
	};
}
