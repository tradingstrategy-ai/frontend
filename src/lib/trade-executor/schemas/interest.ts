/**
 * zod schemas for interest
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/interest.py
 *
 */
import { z } from 'zod';
import { blockNumber, decimal, unixTimestamp } from './utility-types';

export const interestSchema = z.object({
	opening_amount: decimal,
	last_token_amount: decimal,
	last_updated_at: unixTimestamp,
	last_event_at: unixTimestamp,
	last_accrued_interest: decimal,
	last_updated_block_number: blockNumber.nullish(),
	interest_payments: decimal
});
export type Interest = z.infer<typeof interestSchema>;
