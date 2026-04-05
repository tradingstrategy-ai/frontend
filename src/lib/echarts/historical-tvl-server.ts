import { DuckDBConnection } from '@duckdb/node-api';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import type { HistoricalWeeklyVaultRow } from './historical-tvl';
import { VAULT_PRICES_PARQUET_PATH } from '$lib/top-vaults/constants';

export const HISTORICAL_TVL_PARQUET_FILE = VAULT_PRICES_PARQUET_PATH;

export function getMockWeeklyVaultRows(vaults: VaultInfo[]): HistoricalWeeklyVaultRow[] {
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

export async function getHistoricalWeeklyVaultRows(
	parquetFile = HISTORICAL_TVL_PARQUET_FILE
): Promise<HistoricalWeeklyVaultRow[]> {
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
