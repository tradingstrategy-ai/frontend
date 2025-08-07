/**
 * zod schemas for charts
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/chart/definition.py
 *
 */
import { z } from 'zod';
import { tradingPairIdentifierSchema } from './identifier';
import { createTradingPairInfo } from 'trade-executor/models/trading-pair-info';

export const chartKind = z.enum([
	'indicator_single_pair',
	'indicator_multi_pair',
	'indicator_universe',
	'universe_state',
	'state_single_pair',
	'state_single_vault_pair'
]);

export const chartRegistrationSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	kind: chartKind,
	description: z.string()
});
export type ChartRegistration = z.infer<typeof chartRegistrationSchema>;

// NOTE: using name ChartRegistrations instead of ChartRegistry because this
// is exposed via the trade-executor API as an array rather than a record.
export const chartRegistrationsSchema = z.array(chartRegistrationSchema);
export type ChartRegistrations = z.infer<typeof chartRegistrationsSchema>;

export const tradingPairsSchema = z.array(tradingPairIdentifierSchema.transform(createTradingPairInfo));
export type TradingPairs = z.infer<typeof tradingPairsSchema>;

export const chartPairsSchema = z.object({
	default_pairs: tradingPairsSchema,
	all_pairs: tradingPairsSchema
});
export type ChartPairs = z.infer<typeof chartPairsSchema>;
