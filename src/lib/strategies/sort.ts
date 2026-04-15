import type { StrategyInfo } from 'trade-executor/models/strategy-info';

const listingPinnedStrategyOrder = ['opencz', 'hyper-ai', 'master-vault', 'ichi-hyperliquid', 'gmx-ai'] as const;

const frontpagePinnedStrategyOrder = ['opencz', 'master-vault'] as const;

function createPinnedRankMap(strategyIds: readonly string[]) {
	return new Map<string, number>(strategyIds.map((strategyId, index) => [strategyId, strategyIds.length - index]));
}

function createStrategyComparator(pinnedStrategyOrder: readonly string[]) {
	const pinnedStrategyRanks = createPinnedRankMap(pinnedStrategyOrder);

	return function compareStrategies(a: StrategyInfo, b: StrategyInfo) {
		const pinnedRankA = pinnedStrategyRanks.get(a.id) ?? 0;
		const pinnedRankB = pinnedStrategyRanks.get(b.id) ?? 0;

		if (pinnedRankA !== pinnedRankB) {
			return pinnedRankB - pinnedRankA;
		}

		const sortPriorityA = a.sort_priority ?? 0;
		const sortPriorityB = b.sort_priority ?? 0;

		if (sortPriorityA !== sortPriorityB) {
			return sortPriorityB - sortPriorityA;
		}

		return a.name.localeCompare(b.name);
	};
}

/**
 * Sort strategies for frontend listings.
 *
 * Pinned strategies always appear first in a fixed order.
 * Remaining strategies fall back to existing sort priority rules.
 */
export const compareStrategiesForFrontend = createStrategyComparator(listingPinnedStrategyOrder);

/**
 * Sort strategies for the frontpage featured section.
 *
 * OpenCZ should appear before Master Vault, with all other strategies following
 * the default sort-priority behaviour.
 */
export const compareStrategiesForFrontpage = createStrategyComparator(frontpagePinnedStrategyOrder);
