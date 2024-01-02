/**
 * zod schemas for reserve positions
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/reserve.py
 *
 */
import { z } from 'zod';
import { assetIdentifierSchema } from './identifier';
import { decimal, primaryKeyString, unixTimestamp, usDollarAmount } from './utility-types';
import { balanceUpdateSchema } from './balance-update';

export const reservePositionSchema = z.object({
	asset: assetIdentifierSchema,
	quantity: decimal,
	last_sync_at: unixTimestamp,
	reserve_token_price: usDollarAmount.nullish(),
	last_pricing_at: unixTimestamp.nullish(),
	initial_deposit: decimal.nullish(),
	initial_deposit_reserve_token_price: usDollarAmount.nullish(),
	balance_updates: z.record(primaryKeyString, balanceUpdateSchema)
});
export type ReservePosition = z.infer<typeof reservePositionSchema>;
