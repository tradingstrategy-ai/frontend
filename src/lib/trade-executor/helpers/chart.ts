import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import { min, max } from 'd3-array';
import { utcDay } from 'd3-time';

// Determine the chart min/max dates from all strategies to standardize x-axis range
export function getStrategyChartDateRange(strategies: StrategyInfo[]): [Date, Date] {
	// get the latest final date from all strategies
	const latestEndDate = max(strategies, ({ summary_statistics }) => {
		return summary_statistics?.compounding_unrealised_trading_profitability?.at?.(-1)?.[0];
	});

	// beginning of day (UTC) of the last end date (or current time)
	const maxDate = utcDay.floor(latestEndDate ?? new Date());

	// go back 89 days (to get 90 total including maxDate)
	const minDate = utcDay.offset(maxDate, -89);

	return [minDate, maxDate];
}
