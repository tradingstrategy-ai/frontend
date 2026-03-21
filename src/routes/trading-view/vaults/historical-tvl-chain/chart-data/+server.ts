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
import type { VaultInfo } from '$lib/top-vaults/schemas';

// Keep this endpoint aligned with `scripts/benchmark-historical-tvl-chain.mjs`
// so page behaviour and local performance measurements stay comparable.
const compress = promisify(brotliCompress);

const CACHE_TTL_MS = HISTORICAL_TVL_CHAIN_CACHE_TTL_SECONDS * 1000;
const parquetFile = 'data/cleaned-vault-prices-1h.parquet';
const CACHE_VERSION = 'historical-tvl-chain-daily-average-v1';

let cache: { json: string; br: Uint8Array; expires: number; version: string } | null = null;

function getMockWeeklyVaultRows(vaults: VaultInfo[]): HistoricalWeeklyVaultRow[] {
	const weeks = ['2025-12-08', '2025-12-15', '2025-12-22', '2025-12-29', '2026-01-05'];

	return vaults.flatMap((vault, index) => {
		const current = Math.max(vault.current_nav ?? 0, 25_000 + index * 1_000);
		const peak = Math.max(vault.peak_nav ?? 0, current * 1.18, current);
		const values = [peak * 0.62, peak * 0.74, peak * 0.88, peak, current];

		return weeks.map((week, weekIndex) => ({
			id: vault.id,
			chainId: vault.chain_id,
			week,
			tvl: values[weekIndex]
		}));
	});
}

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
	const topVaults = await getCachedTopVaults(fetch);
	const weeklyRows =
		import.meta.env.MODE === 'test' ? getMockWeeklyVaultRows(topVaults.vaults) : await getWeeklyVaultRows();

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
