import type { SlimVaultInfo, VaultAggregates, VaultInfo } from './schemas';
import {
	MAX_APY_THRESHOLD,
	calculateTotalTvl,
	isBlacklisted,
	isAmmPoolLikeVault,
	isEligibleFrontpageVault,
	meetsDefaultTvl,
	meetsMinTvl,
	rankVaultsBy,
	slimVault
} from './helpers';

const FRONT_PAGE_VAULT_COUNT = 5;

/**
 * Select highlighted vaults and calculate front-page metrics.
 *
 * @param vaults all tracked vaults; headline TVL includes every non-blacklisted vault
 */
export function getFrontpageVaults(vaults: VaultInfo[]): { vaults: SlimVaultInfo[]; aggregates: VaultAggregates } {
	const rankedVaults = vaults
		.filter((v) => !isAmmPoolLikeVault(v) && isEligibleFrontpageVault(v) && meetsMinTvl(v) && meetsDefaultTvl(v))
		.filter((v) => {
			const apy = v.three_months_cagr_net ?? v.three_months_cagr;
			return apy != null && Number.isFinite(apy) && apy <= MAX_APY_THRESHOLD && Number.isFinite(v.current_nav);
		})
		.sort(rankVaultsBy(['three_months_cagr', 'three_months_cagr_net']))
		.reverse();
	const rankedTvl = calculateTotalTvl(rankedVaults);
	const weightedAvgApy =
		rankedTvl > 0
			? rankedVaults.reduce((acc, v) => {
					const weight = (v.current_nav ?? 0) / rankedTvl;
					return acc + weight * (v.three_months_cagr_net ?? v.three_months_cagr ?? 0);
				}, 0)
			: 0;

	return {
		// Only serialise the five cards rendered by TopVaults.
		vaults: rankedVaults.slice(0, FRONT_PAGE_VAULT_COUNT).map(slimVault),
		aggregates: {
			totalTvl: calculateTotalTvl(vaults.filter((v) => !isBlacklisted(v))),
			weightedAvgApy,
			rankedVaultCount: rankedVaults.length
		}
	};
}
