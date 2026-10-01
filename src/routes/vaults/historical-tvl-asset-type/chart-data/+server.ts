import { buildHistoricalTvlByAssetTypePayload } from '$lib/echarts/historical-tvl';
import {
	buildCurrentAssetTypeTvlSnapshot,
	type HistoricalTvlByAssetTypePayload
} from '$lib/echarts/historical-tvl-asset-type';
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

	const payload: HistoricalTvlByAssetTypePayload = {
		...buildHistoricalTvlByAssetTypePayload(weeklyRows, topVaults.vaults, performance.now() - startedAt),
		current: buildCurrentAssetTypeTvlSnapshot(topVaults.vaults, topVaults.generated_at)
	};
	const dailyPayload = buildHistoricalTvlByAssetTypePayload(dailyRows, topVaults.vaults, 0);
	payload.daily = {
		weeks: dailyPayload.weeks,
		series: dailyPayload.series
	};
	return payload;
});
