/**
 * zod schemas for valuation updates
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/valuation.py
 *
 */
import { z } from 'zod';
import { blockNumber, primaryKey, unixTimestamp, usDollarAmount, usDollarPrice } from './utility-types';

export const valuationUpdateSchema = z.object({
	position_id: primaryKey,
	created_at: unixTimestamp,
	valued_at: unixTimestamp,
	new_value: usDollarAmount,
	new_price: usDollarPrice,
	old_value: usDollarAmount.nullish(),
	old_price: usDollarPrice.nullish(),
	block_number: blockNumber.nullish()
});
export type ValuationUpdate = z.infer<typeof valuationUpdateSchema>;
