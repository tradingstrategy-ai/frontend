import { query } from '$app/server';
import { DuckDBConnection } from '@duckdb/node-api';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

// TODO: move to env var / config
const parquetFile = 'data/cleaned-vault-prices-1h.parquet';

const connection = await DuckDBConnection.create();

const SQL = `
  SELECT
    CAST(EXTRACT(EPOCH FROM timestamp) AS BIGINT) as timestamp_seconds,
    share_price
  FROM parquet_scan($parquetFile)
  WHERE id = $vaultId
  ORDER BY timestamp
`;

export const getTimeSeries = query(z.string(), async (vaultId) => {
	try {
		const reader = await connection.runAndReadAll(SQL, { parquetFile, vaultId });
		const rows = reader.getRowObjects();
		return rows.map((row) => [Number(row.timestamp_seconds), row.share_price]);
	} catch (e) {
		console.error(`Error loading data from ${parquetFile} for vault <${vaultId}>`);
		const { stack } = e as Error;
		error(500, {
			message: `Error loading vault data for vault id <${vaultId}>`,
			stack: stack ? [stack] : undefined
		});
	}
});
