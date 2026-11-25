import { withDuckDbConnection } from '$lib/server/data-limits';
import { createWarmCache } from '$lib/server/warm-cache';
import type {
	ProtocolMiniChartDailyRow,
	ProtocolMiniChartLatestApyRow,
	ProtocolMiniChartPayload
} from './protocol-mini-chart';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import { ensureVaultPricesParquet } from '$lib/top-vaults/vault-prices-parquet';

export { isEligibleVaultGroupMiniChartVault } from '$lib/top-vaults/helpers';

export const VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS = 60 * 60;
export const VAULT_GROUP_MINI_CHART_THREE_MONTH_LOOKBACK_DAYS = 90;

/** At most this many groups per chart kind stay cached; more than the number of protocols, chains or curators. */
const MAX_CACHED_VAULT_GROUPS = 300;

/**
 * Cache for one kind of hub mini chart (protocol, chain, stablecoin, curator, category),
 * keyed by the group slug and refreshed hourly by the background warmer. Building a chart
 * scans the vault price parquet, so visitors are served the previous chart meanwhile.
 *
 * @param name cache name shown on `/diagnostics`
 * @param build build the payload for one group slug; throw a 404 for unknown slugs
 */
export function createVaultGroupMiniChartCache(
	name: string,
	build: (slug: string, fetch: Fetch) => Promise<ProtocolMiniChartPayload>
) {
	return createWarmCache<ProtocolMiniChartPayload>({
		name,
		load: (slug, fetch) => build(slug, fetch),
		refreshIntervalMs: VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS * 1000,
		maxEntries: MAX_CACHED_VAULT_GROUPS
	});
}

type VaultGroupMiniChartReturnWindow = 'one-month' | 'three-months';

export function getVaultGroupMiniChartLatestApyRows(
	vaults: VaultInfo[],
	returnWindow: VaultGroupMiniChartReturnWindow = 'one-month'
): ProtocolMiniChartLatestApyRow[] {
	return vaults.map((vault) => ({
		id: vault.id,
		tvl: vault.current_nav ?? 0,
		apy:
			returnWindow === 'three-months'
				? (vault.three_months_cagr_net ?? vault.three_months_cagr)
				: (vault.one_month_cagr_net ?? vault.one_month_cagr)
	}));
}

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

	const parquetFile = await ensureVaultPricesParquet();
	const idPlaceholders = vaultIds.map((_, index) => `$id${index}`).join(', ');
	const params = Object.fromEntries(vaultIds.map((id, index) => [`id${index}`, id]));

	return withDuckDbConnection('vault group mini chart', async (connection) => {
		const reader = await connection.runAndReadAll(
			`
				SELECT
					id,
					CAST(timestamp AS DATE) AS day,
					arg_max(total_assets, timestamp) AS tvl,
					CASE
						WHEN arg_max(share_price, timestamp) > 0 THEN arg_max(share_price, timestamp)
						ELSE NULL
					END AS share_price
				FROM parquet_scan($parquetFile)
				WHERE
					id IN (${idPlaceholders})
					AND total_assets >= 0
					AND COALESCE(tvl_filtering_mask, FALSE) = FALSE
				GROUP BY 1, 2
				HAVING day <= current_date
				ORDER BY 2, 1
			`,
			{ parquetFile, ...params }
		);

		return reader.getRows().map(([id, day, tvl, sharePrice]) => ({
			id: String(id),
			day: day as string | Date,
			tvl: Number(tvl),
			sharePrice: sharePrice == null ? null : Number(sharePrice)
		}));
	});
}
