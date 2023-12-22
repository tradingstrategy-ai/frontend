/**
 * zod schemas for state
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/state.py
 *
 */
import { z } from 'zod';
import { count, unixTimestamp } from './utility-types';
import { portfolioSchema } from './portfolio';
import { statisticsSchema } from './statistics';

export const backtestDataSchema = z.object({
	start_at: unixTimestamp,
	end_at: unixTimestamp,
	decision_cycle_duration: z.string()
});

export const stateSchema = z.object({
	created_at: unixTimestamp,
	last_updated_at: unixTimestamp.nullish(),
	cycle: count.positive(),
	name: z.string().nullish(),
	portfolio: portfolioSchema,
	stats: statisticsSchema,
	asset_blacklist: z.string().array(),
	// skipping visualisation, uptime and sync types for now
	// visualisation: visualisation,
	// uptime: uptime,
	// sync: sync
	backtest_data: backtestDataSchema.nullish()
});
