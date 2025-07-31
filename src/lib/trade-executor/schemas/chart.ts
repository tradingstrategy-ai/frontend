/**
 * zod schemas for charts
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/chart/definition.py
 *
 */
import { z } from 'zod';

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
