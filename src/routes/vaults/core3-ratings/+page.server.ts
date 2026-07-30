import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	getRiskRatedVaults,
	getRiskRatingStatistics,
	getRiskRatingTvlBands
} from '$lib/top-vaults/risk-rating-statistics';

export async function load({ fetch }) {
	const topVaults = await getCachedTopVaults(fetch);
	return {
		initialRatingStatistics: getRiskRatingStatistics(getRiskRatedVaults(topVaults, 'core3')),
		initialRiskRatingTvlBands: getRiskRatingTvlBands(topVaults, 'core3')
	};
}
