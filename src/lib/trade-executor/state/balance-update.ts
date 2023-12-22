/**
 * zod schemas for balance updates
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/balance_update.py
 *
 */
import { z } from 'zod';
import { blockNumber, chainId, decimal, hexString, primaryKey, unixTimestamp, usDollarAmount } from './utility-types';
import { assetIdentifierSchema } from './identifier';

export const balanceUpdateCause = z.enum(['deposit', 'redemption', 'interest', 'correction']);

export const balanceUpdatePositionType = z.enum(['reserve', 'open_position']);

export const balanceUpdateSchema = z.object({
	balance_update_id: primaryKey,
	cause: balanceUpdateCause,
	position_type: balanceUpdatePositionType,
	asset: assetIdentifierSchema,
	block_mined_at: unixTimestamp,
	strategy_cycle_included_at: unixTimestamp.nullish(),
	chain_id: chainId,
	quantity: decimal,
	old_balance: decimal,
	usd_value: usDollarAmount,
	created_at: unixTimestamp.nullish(),
	previous_update_at: unixTimestamp.nullish(),
	owner_address: hexString.nullish(),
	tx_hash: hexString.nullish(),
	log_index: hexString.nullish(),
	position_id: primaryKey.nullish(),
	notes: z.string().nullish(),
	block_number: blockNumber.nullish()
});
export type BalanceUpdate = z.infer<typeof balanceUpdateSchema>;
