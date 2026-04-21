import { json } from '@sveltejs/kit';
import { DuckDBConnection } from '@duckdb/node-api';
import { ensureVaultPricesParquet } from '$lib/top-vaults/vault-prices-parquet';

/**
 * Returns the most recent utilisation value for each vault that has utilisation data.
 * Response: Record<vaultId, utilisation> where utilisation is a decimal in [0, 2].
 */
export async function GET() {
	const connection = await DuckDBConnection.create();
	const parquetFile = await ensureVaultPricesParquet();

	try {
		const reader = await connection.runAndReadAll(
			`SELECT DISTINCT ON (id) id,
              CASE WHEN utilisation >= 0 AND utilisation <= 2 THEN utilisation ELSE NULL END AS utilisation
       FROM parquet_scan($parquetFile)
       WHERE utilisation IS NOT NULL AND utilisation >= 0 AND utilisation <= 2
       ORDER BY id, timestamp DESC`,
			{ parquetFile }
		);

		const result: Record<string, number> = {};
		for (const [id, utilisation] of reader.getRows() as [string, number | null][]) {
			if (utilisation !== null) result[id] = utilisation;
		}

		return json(result, { headers: { 'cache-control': 'public, max-age=3600' } });
	} finally {
		connection.closeSync();
	}
}
