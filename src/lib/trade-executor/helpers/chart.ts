import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import { max } from 'd3-array';
import { utcDay } from 'd3-time';
import { downsampleDailySeries, tsToDate } from '$lib/charts/helpers';

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

/**
 * Keep only the chart series used by a strategy tile at daily resolution.
 *
 * @param strategy Strategy data that will be serialised for a tile
 * @returns Strategy data without the unused chart series
 */
export function compactStrategyTileChartData(strategy: StrategyInfo): StrategyInfo {
	const summary = strategy.summary_statistics;
	if (!summary) return strategy;

	const selectedKey = strategy.useSharePrice
		? 'share_price_returns_90_days'
		: 'compounding_unrealised_trading_profitability';
	const discardedKey = strategy.useSharePrice
		? 'compounding_unrealised_trading_profitability'
		: 'share_price_returns_90_days';
	const selectedSeries = summary[selectedKey];

	return {
		...strategy,
		summary_statistics: {
			...summary,
			[discardedKey]: undefined,
			[selectedKey]: selectedSeries ? downsampleDailySeries(selectedSeries) : undefined
		}
	};
}
