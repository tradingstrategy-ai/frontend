/**
 * zod schemas for RunState
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/run_state.py
 *
 */
import { z } from 'zod';
import { count, decimalToNumber, hexString, unixTimestamp } from './utility-types';
import { strategySummaryStatisticsSchema } from './summary';

export const runStateSchema = z.object({
	executor_id: z.string(),
	last_refreshed_at: unixTimestamp,
	started_at: unixTimestamp,
	executor_running: z.boolean(),
	completed_cycle: count,
	cycles: count,
	position_trigger_checks: count,
	position_revaluations: count,
	frozen_positions: count,
	crashed_at: unixTimestamp.nullish(),
	exception: z.object({ exception_message: z.string() }).nullish(),
	hot_wallet_address: hexString.nullish(),
	hot_wallet_gas: decimalToNumber,
	hot_wallet_gas_warning_level: decimalToNumber,
	hot_wallet_gas_warning_message: z.string().nullish(),
	summary_statistics: strategySummaryStatisticsSchema,
	version: z.object({
		tag: z.string().nullish(),
		commit_message: z.string().nullish(),
		commit_hash: z.string().nullish()
	})
});
export type RunState = z.infer<typeof runStateSchema>;
