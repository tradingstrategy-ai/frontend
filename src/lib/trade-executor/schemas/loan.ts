/**
 * zod schemas for loans
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/loan.py
 *
 */
import { z } from 'zod';
import { assetWithTrackedValueSchema, tradingPairIdentifierSchema } from './identifier';
import { interestSchema } from './interest';

export const loanSchema = z.object({
	pair: tradingPairIdentifierSchema,
	collateral: assetWithTrackedValueSchema,
	collateral_interest: interestSchema,
	borrowed: assetWithTrackedValueSchema.nullish(),
	borrowed_interest: interestSchema.nullish()
});
export type Loan = z.infer<typeof loanSchema>;
