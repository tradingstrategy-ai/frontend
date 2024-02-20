/**
 * zod schemas for portfolio and position statistics
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py
 *
 */
import { z } from 'zod';
import { count, percent, primaryKeyString, unixTimestampToDate, usDollarAmount } from './utility-types';
import { tradeSummarySchema } from './trade';
import { longShortTableSchema } from '../statistics/statistics-table';

export const positionStatisticsSchema = z.object({
	calculated_at: unixTimestampToDate,
	last_valuation_at: unixTimestampToDate,
	profitability: percent,
	profit_usd: usDollarAmount,
	quantity: z.number(),
	value: usDollarAmount
});
export type PositionStatistics = z.infer<typeof positionStatisticsSchema>;

export const finalPositionStatisticsSchema = z.object({
	calculated_at: unixTimestampToDate,
	trade_count: count,
	value_at_open: usDollarAmount,
	value_at_max: usDollarAmount
});
export type FinalPositionStatistics = z.infer<typeof finalPositionStatisticsSchema>;

export const portfolioStatisticsSchema = z.object({
	calculated_at: unixTimestampToDate,
	total_equity: usDollarAmount,
	net_asset_value: usDollarAmount.nullish(),
	free_cash: usDollarAmount.nullish(),
	open_position_count: count.nullish(),
	open_position_equity: usDollarAmount.nullish(),
	frozen_position_count: count.nullish(),
	frozen_position_equity: usDollarAmount.nullish(),
	closed_position_count: count.nullish(),
	unrealised_profit_usd: usDollarAmount.nullish(),
	first_trade_at: unixTimestampToDate.nullish(),
	last_trade_at: unixTimestampToDate.nullish(),
	realised_profit_usd: usDollarAmount.nullish(),
	summary: tradeSummarySchema.nullish()
});
export type PortfolioStatistics = z.infer<typeof portfolioStatisticsSchema>;

// TODO: remove long_short_metrics_latest compatibility layer once trade-executor updates deployed
// see: https://github.com/tradingstrategy-ai/trade-executor/issues/760
export const statisticsSchema = z.object({
	portfolio: portfolioStatisticsSchema.array(),
	positions: z.record(primaryKeyString, positionStatisticsSchema.array()),
	closed_positions: z.record(primaryKeyString, finalPositionStatisticsSchema),
	long_short_metrics_latest: z.object({
		live_stats: longShortTableSchema,
		backtested_stats: longShortTableSchema
	})
});
export type Statistics = z.infer<typeof statisticsSchema>;
