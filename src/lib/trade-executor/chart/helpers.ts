import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { min, max } from 'd3-array';
import { utcDay } from 'd3-time';

// Determine the chart min/max dates from all strategies standardize x-axis range
export function getStrategyChartDateRange(strategies: StrategyRuntimeState[]): [Date?, Date?] {
	const today = utcDay.floor(new Date());
	const ninetyDaysAgo = utcDay.offset(today, -90) as Date;

	const minDate = min(strategies, ({ summary_statistics }) => {
		return summary_statistics?.compounding_unrealised_trading_profitability?.[0]?.[0];
	}) as Date;

	const maxDate = max(strategies, ({ summary_statistics }) => {
		return summary_statistics?.compounding_unrealised_trading_profitability?.at(-1)?.[0];
	}) as Date;

	return [max([ninetyDaysAgo, minDate]), maxDate];
}
