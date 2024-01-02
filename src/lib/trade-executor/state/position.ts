/**
 * zod schemas for positions
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/position.py
 *
 */
import { z } from 'zod';
import { assetIdentifierSchema, tradingPairIdentifierSchema } from './identifier';
import { tradeExecutionSchema } from './trade';
import { percent, primaryKey, primaryKeyString, unixTimestampToDate, usDollarAmount } from './utility-types';
import { loanSchema } from './loan';
import { balanceUpdateSchema } from './balance-update';
import { valuationUpdateSchema } from './valuation';
import { createTradeInfo } from './trade-info';
import { createTradingPairInfo } from './trading-pair-info';

export const positionStatus = z.enum(['open', 'closed', 'frozen']);
export type PositionStatus = z.infer<typeof positionStatus>;

export const triggerPriceUpdateSchema = z.object({
	timestamp: unixTimestampToDate,
	mid_price: usDollarAmount.nullish(),
	stop_loss_before: usDollarAmount.nullish(),
	stop_loss_after: usDollarAmount.nullish(),
	take_profit_before: usDollarAmount.nullish(),
	take_profit_after: usDollarAmount.nullish()
});
export type TriggerPriceUpdate = z.infer<typeof triggerPriceUpdateSchema>;

export const tradingPositionSchema = z.object({
	position_id: primaryKey,
	pair: tradingPairIdentifierSchema.transform(createTradingPairInfo),
	opened_at: unixTimestampToDate,
	last_pricing_at: unixTimestampToDate,
	last_token_price: usDollarAmount,
	last_reserve_price: usDollarAmount,
	reserve_currency: assetIdentifierSchema,
	trades: z.record(primaryKeyString, tradeExecutionSchema.transform(createTradeInfo)).transform(Object.values),
	closed_at: unixTimestampToDate.nullish(),
	frozen_at: unixTimestampToDate.nullish(),
	unfrozen_at: unixTimestampToDate.nullish(),
	last_trade_at: unixTimestampToDate.nullish(),
	portfolio_value_at_open: usDollarAmount.nullish(),
	stop_loss: usDollarAmount.nullish(),
	take_profit: usDollarAmount.nullish(),
	trailing_stop_loss_pct: percent.nullish(),
	notes: z.string().nullish(),
	balance_updates: z.record(primaryKeyString, balanceUpdateSchema),
	trigger_updates: triggerPriceUpdateSchema.array(),
	valuation_updates: valuationUpdateSchema.array(),
	loan: loanSchema.nullish(),
	liquidation_price: usDollarAmount.nullish()
});
export type TradingPosition = z.infer<typeof tradingPositionSchema>;

/**
 * English tooltips for the datapoints
 */
export const tradingPositionTooltips = {
	opened_at: 'The strategy cycle decision time when the strategy decided to open this trade.',
	closed_at:
		'The block timestamp when the closing trade of this position executed. This can be outside normal strategy decision making cycles when stop loss or take profit signals are triggered.',
	trailing_stop_loss_pct: 'If trailing stop loss was turned on, what was its value relative to the position value.'
};
