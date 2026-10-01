import { getVaultCurrentTvlUsd } from '$lib/top-vaults/helpers';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import { HISTORICAL_TVL_OUTLIER_THRESHOLD, type HistoricalTvlPayload } from './historical-tvl';

export interface CurrentAssetTypeTvlSnapshot {
	asOf: string;
	totalTvl: number;
	series: Array<{ key: string; label: string; tvl: number; vaultCount: number }>;
}

export interface HistoricalTvlByAssetTypePayload extends HistoricalTvlPayload {
	current: CurrentAssetTypeTvlSnapshot;
}

/**
 * Calculate current USD TVL independently of historical weekly averages.
 *
 * @param vaults Source vault metadata with reported NAV and denomination rates.
 * @param asOf Source export timestamp, rather than the chart request time.
 */
export function buildCurrentAssetTypeTvlSnapshot(
	vaults: Array<Pick<VaultInfo, 'flags' | 'risk_numeric' | 'current_nav' | 'denomination_token_rate'>>,
	asOf: Date | string
): CurrentAssetTypeTvlSnapshot {
	const series = [
		{ key: 'tokenised-funds', label: 'Tokenised funds', tvl: 0, vaultCount: 0 },
		{ key: 'vaults', label: 'Vaults', tvl: 0, vaultCount: 0 }
	];

	for (const vault of vaults) {
		if (vault.risk_numeric === 999) continue;
		const tvl = getVaultCurrentTvlUsd(vault);
		if (tvl == null || !Number.isFinite(tvl) || tvl < 0 || tvl > HISTORICAL_TVL_OUTLIER_THRESHOLD) continue;
		const group = series[vault.flags.includes('tokenised_fund') ? 0 : 1];
		group.tvl += tvl;
		group.vaultCount += 1;
	}

	return {
		asOf: new Date(asOf).toISOString(),
		totalTvl: series.reduce((sum, group) => sum + group.tvl, 0),
		series
	};
}
