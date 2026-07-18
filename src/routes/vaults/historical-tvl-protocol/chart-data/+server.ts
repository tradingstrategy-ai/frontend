import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import {
	HISTORICAL_TVL_CACHE_TTL_SECONDS,
	buildHistoricalTvlByProtocolPayload,
	type HistoricalTvlByProtocolPayload
} from '$lib/echarts/historical-tvl';
import {
	getHistoricalDailyVaultRows,
	getHistoricalWeeklyVaultRows,
	getMockDailyVaultRows,
	getMockWeeklyVaultRows
} from '$lib/echarts/historical-tvl-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const compress = promisify(brotliCompress);

const CACHE_TTL_MS = HISTORICAL_TVL_CACHE_TTL_SECONDS * 1000;
const CACHE_VERSION = 'historical-tvl-protocol-daily-short-history-v1';

let cache: { json: string; br: Uint8Array; expires: number; version: string } | null = null;

async function getCachedChartData(fetch: Fetch) {
	const now = Date.now();
	if (cache && cache.version === CACHE_VERSION && now < cache.expires) return cache;

	const startedAt = performance.now();
	const topVaults = await getCachedTopVaults(fetch);
	const [weeklyRows, dailyRows] =
		import.meta.env.MODE === 'test'
			? [getMockWeeklyVaultRows(topVaults.vaults), getMockDailyVaultRows(topVaults.vaults)]
			: await Promise.all([getHistoricalWeeklyVaultRows(), getHistoricalDailyVaultRows()]);

	const payload: HistoricalTvlByProtocolPayload = buildHistoricalTvlByProtocolPayload(
		weeklyRows,
		topVaults.vaults,
		performance.now() - startedAt
	);
	const dailyPayload = buildHistoricalTvlByProtocolPayload(dailyRows, topVaults.vaults, 0);
	payload.daily = {
		weeks: dailyPayload.weeks,
		series: dailyPayload.series
	};
	const jsonStr = JSON.stringify(payload);
	const br = new Uint8Array(
		await compress(new TextEncoder().encode(jsonStr), {
			params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
		})
	);

	cache = { json: jsonStr, br, expires: now + CACHE_TTL_MS, version: CACHE_VERSION };
	return cache;
}

const cacheHeaders = {
	'cache-control': `public, max-age=${HISTORICAL_TVL_CACHE_TTL_SECONDS}`,
	'content-type': 'application/json',
	vary: 'Accept-Encoding'
};

export async function GET({ fetch, request }) {
	const data = await getCachedChartData(fetch);
	const acceptsBr = request.headers.get('accept-encoding')?.includes('br');

	if (acceptsBr) {
		return new Response(data.br as BodyInit, {
			headers: { ...cacheHeaders, 'content-encoding': 'br' }
		});
	}

	return new Response(data.json, { headers: cacheHeaders });
}
