import type { UTCTimestamp } from 'lightweight-charts';
import { query } from '$app/server';
import { DuckDBConnection } from '@duckdb/node-api';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { resampleTimeSeries } from '$lib/charts/helpers';
import { utcDay } from 'd3-time';

// TODO: move to env var / config
const parquetFile = 'data/cleaned-vault-prices-1h.parquet';

const SQL = `
  SELECT
    EXTRACT(EPOCH FROM timestamp) as ts,
    share_price
  FROM parquet_scan($parquetFile)
  WHERE id = $vaultId
  ORDER BY timestamp
`;

export const getTimeSeries = query(z.string(), async (vaultId) => {
	const connection = await DuckDBConnection.create();

	try {
		const reader = await connection.runAndReadAll(SQL, { parquetFile, vaultId });
		const rows = reader.getRows() as [UTCTimestamp, number][];
		return resampleTimeSeries(rows, utcDay, new Date());
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
});
