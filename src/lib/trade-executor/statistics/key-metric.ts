/**
 * zod schemas for strategy and position key metrics
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/summary.py
 *
 */
import { z } from 'zod';
import { unixTimestampToDate } from '../state/utility-types';

export const keyMetricSource = z.enum(['backtesting', 'live_trading', 'missing']);

export const keyMetricCalculationMethod = z.enum(['historical_data', 'latest_value']);

export const keyMetricSchema = z.object({
	kind: z.string(),
	source: keyMetricSource,
	value: z.union([z.number(), z.string()]).nullish(),
	calculation_window_start_at: unixTimestampToDate.nullish(),
	calculation_window_end_at: unixTimestampToDate.nullish(),
	calculation_method: keyMetricCalculationMethod.nullish(),
	unavailability_reason: z.string().nullish(),
	help_link: z.string().url().nullish(),
	name: z.string().nullish()
});
export type KeyMetric = z.infer<typeof keyMetricSchema>;
