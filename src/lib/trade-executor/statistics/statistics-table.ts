/**
 * zod schemas for statistics tables
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/statistics/statistics_table.py
 *
 * Additional sources for specific schemas referenced below
 *
 */
import { z } from 'zod';
import { keyMetricKind, keyMetricSchema, keyMetricSource } from './key-metric';
import { unixTimestampToDate } from 'trade-executor/state/utility-types';

export const statisticsTableMetricSchema = keyMetricSchema.extend({
	value: z.record(z.string())
});
export type StatisticsTableMetric = z.infer<typeof statisticsTableMetricSchema>;

export const statisticsTableSchema = z.object({
	columns: z.string().array(),
	rows: z.record(statisticsTableMetricSchema),
	created_at: unixTimestampToDate,
	source: keyMetricSource.nullish(),
	calculationWindowStartAt: unixTimestampToDate.nullish(),
	calculationWindowEndAt: unixTimestampToDate.nullish()
});
export type StatisticsTable = z.infer<typeof statisticsTableSchema>;

export const longShortTableColumns = z.enum(['All', 'Long', 'Short']);

const longShortTableMetricSchema = statisticsTableMetricSchema.extend({
	// FIXME: value should be a string, but is currently an object for
	// some metrics (return_percent, annualised_return_percent)
	value: z.record(longShortTableColumns, z.any())
});

export const longShortTableSchema = statisticsTableSchema.extend({
	columns: longShortTableColumns.array(),
	rows: z.record(keyMetricKind, longShortTableMetricSchema)
});
export type LongShortTable = z.infer<typeof longShortTableSchema>;
