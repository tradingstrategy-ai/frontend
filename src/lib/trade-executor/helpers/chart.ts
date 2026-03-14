import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import { max } from 'd3-array';
import { utcDay } from 'd3-time';
import { tsToDate } from '$lib/charts/helpers';

// Determine the chart min/max dates from all strategies to standardize x-axis range
export function getStrategyChartDateRange(strategies: StrategyInfo[]): [Date, Date] {
	// get the latest final date from all strategies
	const latestEndTs = max(strategies, ({ useSharePrice, summary_statistics }) => {
		const chartSeries = useSharePrice
			? summary_statistics?.share_price_returns_90_days
			: summary_statistics?.compounding_unrealised_trading_profitability;
		return chartSeries?.at?.(-1)?.[0];
	});

	// beginning of day (UTC) of the last end date (or current time)
	const maxDate = utcDay.floor(latestEndTs ? tsToDate(latestEndTs) : new Date());

	// go back 89 days (to get 90 total including maxDate)
	const minDate = utcDay.offset(maxDate, -89);

	return [minDate, maxDate];
}
