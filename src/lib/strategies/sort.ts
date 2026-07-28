import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import { getMetricsWithAltCAGR } from 'trade-executor/helpers/metrics';
import { relativeReturn } from '$lib/helpers/financial';

const frontpagePinnedStrategyOrder = ['master-vault', 'hyper-ai', 'vega'] as const;

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
 * Get the return used to colour a strategy tile chart.
 *
 * The main listing uses this same value to group vaults, so green charts are
 * shown before red charts.
 */
function getTileChartReturn(strategy: StrategyInfo): number | undefined {
	const data = strategy.useSharePrice
		? strategy.summary_statistics?.share_price_returns_90_days
		: strategy.summary_statistics?.compounding_unrealised_trading_profitability;

	const start = data?.[0]?.[1];
	const end = data?.at(-1)?.[1];
	const value = strategy.tileChartDirection === 'relative' ? relativeReturn(start, end) : end;

	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Get a strategy's displayed annual return for ordering within its chart-colour group.
 */
function getAnnualReturn(strategy: StrategyInfo): number | undefined {
	const value = getMetricsWithAltCAGR(strategy).cagr?.value;
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getTileChartColourRank(strategy: StrategyInfo) {
	const chartReturn = getTileChartReturn(strategy);

	if (chartReturn === undefined) return 3;
	if (chartReturn > 0) return 0;
	if (chartReturn < 0) return 1;
	return 2;
}

/**
 * Sort strategies for the main listing by chart colour and annual return.
 *
 * Green tile charts appear first, then red charts. Neutral and unavailable
 * charts follow. Within each group, the highest annual return appears first.
 * Sort priority and name provide a deterministic order for ties or missing data.
 */
export function compareStrategiesForFrontend(a: StrategyInfo, b: StrategyInfo) {
	const chartColourRankA = getTileChartColourRank(a);
	const chartColourRankB = getTileChartColourRank(b);

	if (chartColourRankA !== chartColourRankB) {
		return chartColourRankA - chartColourRankB;
	}

	const annualReturnA = getAnnualReturn(a);
	const annualReturnB = getAnnualReturn(b);

	if (annualReturnA !== undefined && annualReturnB !== undefined && annualReturnA !== annualReturnB) {
		return annualReturnB - annualReturnA;
	}

	if (annualReturnA !== undefined && annualReturnB === undefined) return -1;
	if (annualReturnA === undefined && annualReturnB !== undefined) return 1;

	const sortPriorityA = a.sort_priority ?? 0;
	const sortPriorityB = b.sort_priority ?? 0;

	if (sortPriorityA !== sortPriorityB) {
		return sortPriorityB - sortPriorityA;
	}

	return a.name.localeCompare(b.name);
}

/**
 * Sort strategies for the frontpage featured section.
 *
 * Its curated order is intentionally independent of the performance-ranked
 * strategy listing.
 */
export const compareStrategiesForFrontpage = createStrategyComparator(frontpagePinnedStrategyOrder);
