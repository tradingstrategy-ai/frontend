/**
 * Yield leaders for the "best stablecoin yields right now" comparison on `/vaults/stablecoins`:
 * the highest-APY vaults of a group, and the median APY, under stricter rules than the listing
 * table because they are presented as an answer to "best … yield".
 *
 * See `.claude/plans/seo-round-4-vault-rankings.md`, workstream 7.
 */
import {
	getFormattedLockup,
	getMonthlyReturn,
	getVaultAssetType,
	getVaultCurrentTvlUsd,
	getVaultProtocolDisplayName,
	isBlacklisted,
	isVaultIndexable
} from '../helpers';
import type { VaultInfo } from '../schemas';

/** A vault with less TVL than this cannot be an APY leader: small vaults swing wildly. */
export const LEADER_MIN_TVL_USD = 100_000;

/** A vault younger than this cannot be an APY leader: a new vault's 30-day APY is noise. */
export const LEADER_MIN_AGE_YEARS = 0.25;

/**
 * A vault above this APY (100 %) is not presented as a leader: on real data every such vault is a
 * trading vault, an AMM pool or an accounting artefact, not a yield a "best <coin> yield" searcher
 * is looking for.
 */
export const LEADER_MAX_APY = 1;

/** Leaders must be rated Low risk or safer (`riskFilterOptions` "Low or safer"); unrated vaults are left out. */
export const LEADER_MAX_RISK = 20;

/**
 * Strategy tags of vaults whose returns come from trading, not yield. The risk rating is the
 * protocol's technical risk, so a discretionary trading fund on a low-risk protocol would
 * otherwise top "best USDC yield" with a 70 % month.
 */
const TRADING_STRATEGY_TAGS = new Set([
	'algorithmic_trading',
	'directional_leverage',
	'directional_trading',
	'discretionary_trading',
	'grid_trading',
	'mean_reversion',
	'options',
	'pair_trading',
	'perpetual_futures',
	'statistical_arbitrage',
	'trend_following',
	'venture_funding'
]);

/**
 * Yield vaults only: no liquidity pools, no tokenised funds, no trading strategies.
 *
 * @param vault listed vault
 */
function isYieldVault(vault: VaultInfo): boolean {
	if (getVaultAssetType(vault) !== 'vault') return false;
	return !(vault.strategy_tags ?? []).some((tag) => TRADING_STRATEGY_TAGS.has(tag));
}

export type ListingLeader = {
	name: string;
	slug: string;
	apy: number;
	tvlUsd: number;
	/** What sets the leaders apart, for the comparison table */
	protocol: string;
	curator: string | null;
	lockup: string;
	feeLabel: string | null;
	risk: string | null;
};

export type YieldLeaders = {
	/** Up to three highest-APY vaults that pass the minimum TVL, age and risk and the APY ceiling */
	leaders: ListingLeader[];
	/** Median APY of the vaults that pass the same rules */
	medianApy: number | null;
	/** Number of vaults the leaders and median were chosen from */
	eligibleCount: number;
};

/**
 * Median of a list of numbers, or `null` when the list is empty.
 *
 * @param values numbers in any order
 */
function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = values.toSorted((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * The highest-APY yield vaults of a group and its median APY.
 *
 * @param vaults the vaults to choose from, e.g. all listed vaults of one stablecoin
 */
export function getYieldLeaders(vaults: VaultInfo[]): YieldLeaders {
	const eligible = vaults
		.filter(
			(vault) =>
				!isBlacklisted(vault) &&
				isVaultIndexable(vault) &&
				isYieldVault(vault) &&
				(vault.years ?? 0) >= LEADER_MIN_AGE_YEARS &&
				vault.risk_numeric != null &&
				vault.risk_numeric <= LEADER_MAX_RISK
		)
		.map((vault) => ({ vault, apy: getMonthlyReturn(vault), tvlUsd: getVaultCurrentTvlUsd(vault) }))
		.filter(
			(row): row is { vault: VaultInfo; apy: number; tvlUsd: number } =>
				row.apy != null &&
				Number.isFinite(row.apy) &&
				row.apy <= LEADER_MAX_APY &&
				row.tvlUsd != null &&
				row.tvlUsd >= LEADER_MIN_TVL_USD
		);

	const leaders = eligible
		.toSorted((a, b) => b.apy - a.apy)
		.slice(0, 3)
		.map(({ vault, apy, tvlUsd }) => ({
			name: vault.name,
			slug: vault.vault_slug,
			apy,
			tvlUsd,
			protocol: getVaultProtocolDisplayName(vault),
			curator: vault.curator_name?.trim() || null,
			lockup: getFormattedLockup(vault),
			feeLabel: vault.fee_label ?? null,
			risk: vault.risk ?? null
		}));

	return {
		leaders,
		medianApy: median(eligible.map((row) => row.apy)),
		eligibleCount: eligible.length
	};
}
