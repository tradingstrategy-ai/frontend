import { DuckDBConnection } from '@duckdb/node-api';
import { ensureVaultPricesParquet } from '$lib/top-vaults/vault-prices-parquet';

export interface VaultPriceQueryRow {
	id: string;
	timestamp: number;
	sharePrice: number;
	totalAssets?: number;
	utilisation?: number | null;
}

interface VaultPriceQueryOptions {
	includeVaultMetrics?: boolean;
	parquetFile?: string;
	resolveParquetFile?: () => Promise<string>;
}

/**
 * Read one or more vault price histories with a single DuckDB connection and
 * parquet scan.
 *
 * @param vaultIds Validated vault identifiers to query
 * @param options Optional metric columns and injectable parquet source for tests
 */
export async function queryVaultPriceRows(
	vaultIds: readonly string[],
	options: VaultPriceQueryOptions = {}
): Promise<VaultPriceQueryRow[]> {
	if (!vaultIds.length) return [];

	const parquetFile = options.parquetFile ?? (await (options.resolveParquetFile ?? ensureVaultPricesParquet)());
	const connection = await DuckDBConnection.create();

	try {
		const idParameters = Object.fromEntries(vaultIds.map((vaultId, index) => [`vaultId${index}`, vaultId]));
		const placeholders = vaultIds.map((_, index) => `$vaultId${index}`).join(', ');
		const optionalColumns = options.includeVaultMetrics
			? `, total_assets,
              CASE WHEN utilisation >= 0 AND utilisation <= 2 THEN utilisation ELSE NULL END as utilisation`
			: '';
		const reader = await connection.runAndReadAll(
			`SELECT id, EXTRACT(EPOCH FROM timestamp) as ts, share_price${optionalColumns}
       FROM parquet_scan($parquetFile)
       WHERE id IN (${placeholders})
       ORDER BY id, timestamp`,
			{ parquetFile, ...idParameters }
		);

		return reader.getRows().map((row) => {
			const [id, timestamp, sharePrice, totalAssets, utilisation] = row as [
				string,
				number,
				number,
				number | undefined,
				number | null | undefined
			];
			return {
				id,
				timestamp,
				sharePrice,
				...(options.includeVaultMetrics ? { totalAssets, utilisation } : {})
			};
		});
	} finally {
		connection.closeSync();
	}
}
