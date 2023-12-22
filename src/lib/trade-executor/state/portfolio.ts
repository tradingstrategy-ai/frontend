/**
 * zod schemas for strategy portfolio
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/portfolio.py
 *
 */
import { z } from 'zod';
import { primaryKey, primaryKeyString } from './utility-types';
import { tradingPositionSchema } from './position';
import { reservePositionSchema } from './reserve';

export const portfolioSchema = z.object({
	next_position_id: primaryKey,
	next_trade_id: primaryKey,
	next_balance_update_id: primaryKey,
	open_positions: z.record(primaryKeyString, tradingPositionSchema),
	reserves: z.record(reservePositionSchema),
	closed_positions: z.record(primaryKeyString, tradingPositionSchema),
	frozen_positions: z.record(primaryKeyString, tradingPositionSchema)
});
