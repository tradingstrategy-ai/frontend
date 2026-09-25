/**
 * The "best stablecoin yields right now" comparison on `/vaults/stablecoins`: for each of the
 * largest stablecoins by USD TVL, its leading vault under the rules in `insights.ts`.
 *
 * See `.claude/plans/seo-round-4-vault-rankings.md`, workstream 7.
 */
import { getVaultCurrentTvlUsd } from '../helpers';
import type { VaultInfo } from '../schemas';
import { getYieldLeaders, type ListingLeader } from './insights';

export type StablecoinYieldRow = {
	/** Canonical stablecoin slug, as used by the stablecoin hub URL */
	slug: string;
	symbol: string;
	name: string | undefined;
	/** USD TVL of the stablecoin's listed vaults, used to pick the largest stablecoins */
	tvlUsd: number;
	/** The leading vault, or `null` when no vault of this stablecoin meets the leader rules */
	best: ListingLeader | null;
	medianApy: number | null;
	compared: number;
};

type StablecoinYieldOptions = {
	/** Map a vault to its canonical stablecoin slug (aliases resolved) */
	resolveSlug: (vault: VaultInfo) => string;
	/** Display name of a stablecoin by canonical slug */
	getName?: (slug: string) => string | undefined;
	/** Number of stablecoins to compare */
	limit?: number;
};

/**
 * Build the comparison rows.
 *
 * Stablecoins are ranked by the USD TVL of their vaults — not by raw token amounts, which differ in
 * scale between currencies. A large stablecoin with no qualifying vault keeps its row with
 * `best: null` rather than being replaced by a smaller one, so the table shows the largest
 * stablecoins honestly.
 *
 * @param vaults listed stablecoin-denominated vaults (blacklist and minimum TVL already applied)
 * @param options slug resolution, display names and row count
 */
export function getStablecoinYieldComparison(
	vaults: VaultInfo[],
	{ resolveSlug, getName = () => undefined, limit = 8 }: StablecoinYieldOptions
): StablecoinYieldRow[] {
	const groups = new Map<string, { symbol: string; vaults: VaultInfo[]; tvlUsd: number }>();
	for (const vault of vaults) {
		const slug = resolveSlug(vault);
		const group = groups.get(slug) ?? { symbol: vault.normalised_denomination, vaults: [], tvlUsd: 0 };
		group.vaults.push(vault);
		group.tvlUsd += getVaultCurrentTvlUsd(vault) ?? 0;
		groups.set(slug, group);
	}

	return [...groups]
		.toSorted(([, a], [, b]) => b.tvlUsd - a.tvlUsd)
		.slice(0, limit)
		.map(([slug, group]) => {
			const insights = getYieldLeaders(group.vaults);
			return {
				slug,
				symbol: group.symbol,
				name: getName(slug),
				tvlUsd: group.tvlUsd,
				best: insights.leaders[0] ?? null,
				medianApy: insights.medianApy,
				compared: insights.eligibleCount
			};
		});
}
