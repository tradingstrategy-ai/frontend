/**
 * zod schemas for state
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/state.py
 *
 */
import { z } from 'zod';
import { count, unixTimestamp, usDollarAmount } from './utility-types';
import { portfolioSchema } from './portfolio';
import { statisticsSchema } from './statistics';

export const backtestDataSchema = z.object({
	start_at: unixTimestamp,
	end_at: unixTimestamp,
	decision_cycle_duration: z.string()
});

export const treasurySyncSchema = z
	.object({
		pending_deposits: usDollarAmount.nullish(),
		pending_redemptions: usDollarAmount.nullish()
	})
	.passthrough();
export type TreasurySync = z.infer<typeof treasurySyncSchema>;

export const syncSchema = z
	.object({
		treasury: treasurySyncSchema.nullish()
	})
	.passthrough();
export type Sync = z.infer<typeof syncSchema>;

export const stateSchema = z.object({
	created_at: unixTimestamp,
	last_updated_at: unixTimestamp.nullish(),
	cycle: count.positive(),
	name: z.string().nullish(),
	portfolio: portfolioSchema,
	stats: statisticsSchema,
	asset_blacklist: z.string().array(),
	sync: syncSchema.nullish(),
	// skipping visualisation and uptime types for now
	// visualisation: visualisation,
	// uptime: uptime,
	backtest_data: backtestDataSchema.nullish()
});
export type State = z.infer<typeof stateSchema>;
