import type { UTCTimestamp } from 'lightweight-charts';
import { query } from '$app/server';
import { error } from '@sveltejs/kit';
import { DuckDBConnection } from '@duckdb/node-api';
import { z } from 'zod';
import { utcDay } from 'd3-time';
import { dateToTs, resampleTimeSeries } from '$lib/charts/helpers';

// TODO: move to env var / config
const parquetFile = 'data/cleaned-vault-prices-1h.parquet';

async function getPriceAndTvlData(vaultId: string) {
	const connection = await DuckDBConnection.create();

	try {
		const reader = await connection.runAndReadAll(
			`SELECT EXTRACT(EPOCH FROM timestamp) as ts, share_price, total_assets
       FROM parquet_scan($parquetFile)
       WHERE id = $vaultId
       ORDER BY timestamp`,
			{ parquetFile, vaultId }
		);
		return reader.getRows() as [UTCTimestamp, number, number][];
	} catch (e) {
		console.error(`Error loading data from ${parquetFile} for vault <${vaultId}>`);
		const { stack } = e as Error;
		error(500, {
			message: `Error loading vault data for vault id <${vaultId}>`,
			stack: stack ? [stack] : undefined
		});
	} finally {
		connection.closeSync();
	}
}

export const getTimeSeries = query(z.string(), async (vaultId) => {
	const rows = await getPriceAndTvlData(vaultId);

	const priceData: [UTCTimestamp, number][] = [];
	const tvlData: [UTCTimestamp, number][] = [];

	for (const [ts, price, tvl] of rows) {
		priceData.push([ts, price]);
		tvlData.push([ts, tvl]);
	}

	return { price: priceData, tvl: tvlData };
});
