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
import { unixTimestampToDate } from './utility-types';
import { keyMetricSchema, keyMetricSource } from './key-metric';

export const statisticsTableMetricSchema = keyMetricSchema.extend({
	value: z.record(z.string(), z.string())
});
export type StatisticsTableMetric = z.infer<typeof statisticsTableMetricSchema>;

export const statisticsTableSchema = z.object({
	columns: z.string().array(),
	rows: z.record(z.string(), statisticsTableMetricSchema),
	created_at: unixTimestampToDate,
	source: keyMetricSource.nullish(),
	calculationWindowStartAt: unixTimestampToDate.nullish(),
	calculationWindowEndAt: unixTimestampToDate.nullish()
});
export type StatisticsTable = z.infer<typeof statisticsTableSchema>;

export const longShortTableColumns = z.enum(['All', 'Long', 'Short']);

const longShortTableMetricSchema = statisticsTableMetricSchema.extend({
	value: z.record(longShortTableColumns, z.coerce.string())
});

export const longShortTableSchema = statisticsTableSchema.extend({
	columns: longShortTableColumns.array(),
	rows: z.record(z.string(), longShortTableMetricSchema)
});
export type LongShortTable = z.infer<typeof longShortTableSchema>;
