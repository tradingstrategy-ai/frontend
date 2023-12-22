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
import { percent, primaryKey, primaryKeyString, unixTimestamp, usDollarAmount } from './utility-types';
import { loanSchema } from './loan';
import { balanceUpdateSchema } from './balance-update';
import { valuationUpdateSchema } from './valuation';

export const positionStatus = z.enum(['open', 'closed', 'frozen']);
export type PositionStatus = z.infer<typeof positionStatus>;

export const triggerPriceUpdateSchema = z.object({
	timestamp: unixTimestamp,
	mid_price: usDollarAmount.nullish(),
	stop_loss_before: usDollarAmount.nullish(),
	stop_loss_after: usDollarAmount.nullish(),
	take_profit_before: usDollarAmount.nullish(),
	take_profit_after: usDollarAmount.nullish()
});
export type TriggerPriceUpdate = z.infer<typeof triggerPriceUpdateSchema>;

export const tradingPositionSchema = z.object({
	position_id: primaryKey,
	pair: tradingPairIdentifierSchema,
	opened_at: unixTimestamp,
	last_pricing_at: unixTimestamp,
	last_token_price: usDollarAmount,
	last_reserve_price: usDollarAmount,
	reserve_currency: assetIdentifierSchema,
	trades: z.record(primaryKeyString, tradeExecutionSchema),
	closed_at: unixTimestamp.nullish(),
	frozen_at: unixTimestamp.nullish(),
	unfrozen_at: unixTimestamp.nullish(),
	last_trade_at: unixTimestamp.nullish(),
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
