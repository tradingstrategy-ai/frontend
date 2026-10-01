import {
	buildHistoricalTvlByStablecoinPayload,
	type HistoricalTvlByStablecoinPayload
} from '$lib/echarts/historical-tvl';
import {
	getHistoricalDailyVaultRows,
	getHistoricalWeeklyVaultRows,
	getMockDailyVaultRows,
	getMockWeeklyVaultRows
} from '$lib/echarts/historical-tvl-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

import { createHistoricalTvlEndpoint } from '$lib/echarts/historical-tvl-endpoint';

export const GET = createHistoricalTvlEndpoint(async (fetch) => {
	const startedAt = performance.now();
	const topVaults = await getCachedTopVaults(fetch);
	const [weeklyRows, dailyRows] =
		import.meta.env.MODE === 'test'
			? [getMockWeeklyVaultRows(topVaults.vaults), getMockDailyVaultRows(topVaults.vaults)]
			: await Promise.all([getHistoricalWeeklyVaultRows(), getHistoricalDailyVaultRows()]);

	const payload: HistoricalTvlByStablecoinPayload = buildHistoricalTvlByStablecoinPayload(
		weeklyRows,
		topVaults.vaults,
		performance.now() - startedAt
	);
	const dailyPayload = buildHistoricalTvlByStablecoinPayload(dailyRows, topVaults.vaults, 0);
	payload.daily = {
		weeks: dailyPayload.weeks,
		series: dailyPayload.series
	};
	return payload;
});
