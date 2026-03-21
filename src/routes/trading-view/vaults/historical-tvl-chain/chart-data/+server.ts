import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { DuckDBConnection } from '@duckdb/node-api';
import {
	HISTORICAL_TVL_CHAIN_CACHE_TTL_SECONDS,
	buildHistoricalTvlByChainPayload,
	type HistoricalTvlByChainPayload,
	type HistoricalWeeklyVaultRow
} from '$lib/echarts/historical-tvl-chain';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

// Keep this endpoint aligned with `scripts/benchmark-historical-tvl-chain.mjs`
// so page behaviour and local performance measurements stay comparable.
const compress = promisify(brotliCompress);

const CACHE_TTL_MS = HISTORICAL_TVL_CHAIN_CACHE_TTL_SECONDS * 1000;
const parquetFile = 'data/cleaned-vault-prices-1h.parquet';
const CACHE_VERSION = 'historical-tvl-chain-daily-average-v1';

let cache: { json: string; br: Uint8Array; expires: number; version: string } | null = null;

async function getWeeklyVaultRows(): Promise<HistoricalWeeklyVaultRow[]> {
	const connection = await DuckDBConnection.create();

	try {
		const reader = await connection.runAndReadAll(
			`
				WITH daily AS (
					SELECT
						id,
						chain AS chain_id,
						CAST(timestamp AS DATE) AS day,
						arg_max(total_assets, timestamp) AS tvl
					FROM parquet_scan($parquetFile)
					WHERE total_assets >= 0
					GROUP BY 1, 2, 3
				),
				weekly AS (
					SELECT
						id,
						chain_id,
						date_trunc('week', day) AS week,
						avg(tvl) AS tvl
					FROM daily
					GROUP BY 1, 2, 3
				)
				SELECT
					id,
					chain_id,
					week,
					tvl
				FROM weekly
				WHERE week < date_trunc('week', current_date)
				ORDER BY 3, 2, 1
			`,
			{ parquetFile }
		);

		return reader.getRows().map(([id, chainId, week, tvl]) => ({
			id: String(id),
			chainId: Number(chainId),
			week: week as string | Date,
			tvl: Number(tvl)
		}));
	} finally {
		connection.closeSync();
	}
}

async function getCachedChartData(fetch: Fetch) {
	const now = Date.now();
	if (cache && cache.version === CACHE_VERSION && now < cache.expires) return cache;

	const startedAt = performance.now();
	const [topVaults, weeklyRows] = await Promise.all([getCachedTopVaults(fetch), getWeeklyVaultRows()]);

	const payload: HistoricalTvlByChainPayload = buildHistoricalTvlByChainPayload(
		weeklyRows,
		topVaults.vaults,
		performance.now() - startedAt
	);
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
	'cache-control': `public, max-age=${HISTORICAL_TVL_CHAIN_CACHE_TTL_SECONDS}`,
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
