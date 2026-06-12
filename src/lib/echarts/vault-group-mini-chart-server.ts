import { DuckDBConnection } from '@duckdb/node-api';
import type { ProtocolMiniChartDailyRow } from './protocol-mini-chart';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import { ensureVaultPricesParquet } from '$lib/top-vaults/vault-prices-parquet';

export { isEligibleVaultGroupMiniChartVault } from '$lib/top-vaults/helpers';

export const VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS = 60 * 60;

export function getMockVaultGroupMiniChartRows(vaults: VaultInfo[]): ProtocolMiniChartDailyRow[] {
	const days = Array.from({ length: 120 }, (_, index) => {
		const date = new Date('2025-09-01T00:00:00Z');
		date.setUTCDate(date.getUTCDate() + index);
		return date.toISOString().slice(0, 10);
	});

	return vaults.flatMap((vault, vaultIndex) => {
		const currentTvl = Math.max(vault.current_nav ?? 0, 25_000 + vaultIndex * 5_000);
		const startTvl = currentTvl * (0.72 + vaultIndex * 0.04);
		const priceDrift = 0.05 + vaultIndex * 0.015;

		return days.map((day, dayIndex) => {
			const progress = dayIndex / Math.max(days.length - 1, 1);
			return {
				id: vault.id,
				day,
				tvl: startTvl + (currentTvl - startTvl) * progress,
				sharePrice: 1 + priceDrift * progress
			};
		});
	});
}

export async function getVaultGroupMiniChartRows(vaultIds: string[]): Promise<ProtocolMiniChartDailyRow[]> {
	if (vaultIds.length === 0) return [];

	const connection = await DuckDBConnection.create();
	const parquetFile = await ensureVaultPricesParquet();
	const idPlaceholders = vaultIds.map((_, index) => `$id${index}`).join(', ');
	const params = Object.fromEntries(vaultIds.map((id, index) => [`id${index}`, id]));

	try {
		const reader = await connection.runAndReadAll(
			`
				SELECT
					id,
					CAST(timestamp AS DATE) AS day,
					arg_max(total_assets, timestamp) AS tvl,
					arg_max(share_price, timestamp) AS share_price
				FROM parquet_scan($parquetFile)
				WHERE
					id IN (${idPlaceholders})
					AND total_assets >= 0
					AND share_price > 0
					AND COALESCE(tvl_filtering_mask, FALSE) = FALSE
				GROUP BY 1, 2
				HAVING day < current_date
				ORDER BY 2, 1
			`,
			{ parquetFile, ...params }
		);

		return reader.getRows().map(([id, day, tvl, sharePrice]) => ({
			id: String(id),
			day: day as string | Date,
			tvl: Number(tvl),
			sharePrice: Number(sharePrice)
		}));
	} finally {
		connection.closeSync();
	}
}
