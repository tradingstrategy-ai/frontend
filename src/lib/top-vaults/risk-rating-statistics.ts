/**
 * Filter and summarise vaults covered by a third-party risk-rating provider.
 */
import type { RiskRatingProvider } from './risk-rating-providers';
import type { TopVaults, VaultInfo } from './schemas';
import {
	calculateTotalTvl,
	calculateTvlWeightedApy,
	getCore3PolForVault,
	getVaultCurrentTvlUsd,
	isBlacklisted
} from './helpers';

export type RiskRatingStatistics = {
	totalTvl: number;
	vaultCount: number;
	blockchainCount: number;
	averageMonthlyReturn: number | null;
};

/** Return all non-blacklisted vaults with a rating from the selected provider. */
export function getRiskRatedVaults(topVaults: TopVaults, provider: RiskRatingProvider): VaultInfo[] {
	return topVaults.vaults.filter((vault) => {
		if (isBlacklisted(vault)) return false;
		if (provider === 'xerberus') return vault.xerberus?.score != null;

		const core3 = getCore3PolForVault(vault, topVaults.core3_protocols);
		return core3?.score != null && core3.rating != null;
	});
}

/** Calculate USD TVL, coverage, and TVL-weighted one-month return for rated vaults. */
export function getRiskRatingStatistics(vaults: VaultInfo[]): RiskRatingStatistics {
	const vaultsWithUsdTvl = vaults.map((vault) => ({ ...vault, current_nav: getVaultCurrentTvlUsd(vault) }));

	return {
		totalTvl: calculateTotalTvl(vaultsWithUsdTvl),
		vaultCount: vaults.length,
		blockchainCount: new Set(vaults.map((vault) => vault.chain_id)).size,
		averageMonthlyReturn: calculateTvlWeightedApy(vaultsWithUsdTvl)
	};
}
