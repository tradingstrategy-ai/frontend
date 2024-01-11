/**
 * zod schemas for portfolio and position statistics
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py
 *
 */
import { z } from 'zod';
import { count, percent, primaryKeyString, unixTimestamp, usDollarAmount } from './utility-types';
import { tradeSummarySchema } from './trade';

export const positionStatisticsSchema = z.object({
	calculated_at: unixTimestamp,
	last_valuation_at: unixTimestamp,
	profitability: percent,
	profit_usd: usDollarAmount,
	quantity: z.number(),
	value: usDollarAmount
});
export type PositionStatistics = z.infer<typeof positionStatisticsSchema>;

export const finalPositionStatisticsSchema = z.object({
	calculated_at: unixTimestamp,
	trade_count: count,
	value_at_open: usDollarAmount,
	value_at_max: usDollarAmount
});
export type FinalPositionStatistics = z.infer<typeof finalPositionStatisticsSchema>;

export const portfolioStatisticsSchema = z.object({
	calculated_at: unixTimestamp,
	total_equity: usDollarAmount,
	net_asset_value: usDollarAmount.nullish(),
	free_cash: usDollarAmount.nullish(),
	open_position_count: count.nullish(),
	open_position_equity: usDollarAmount.nullish(),
	frozen_position_count: count.nullish(),
	frozen_position_equity: usDollarAmount.nullish(),
	closed_position_count: count.nullish(),
	unrealised_profit_usd: usDollarAmount.nullish(),
	first_trade_at: unixTimestamp.nullish(),
	last_trade_at: unixTimestamp.nullish(),
	realised_profit_usd: usDollarAmount.nullish(),
	summary: tradeSummarySchema.nullish()
});
export type PortfolioStatistics = z.infer<typeof portfolioStatisticsSchema>;

export const statisticsSchema = z.object({
	portfolio: portfolioStatisticsSchema.array(),
	positions: z.record(primaryKeyString, positionStatisticsSchema.array()),
	closed_positions: z.record(primaryKeyString, finalPositionStatisticsSchema)
});
export type Statistics = z.infer<typeof statisticsSchema>;
