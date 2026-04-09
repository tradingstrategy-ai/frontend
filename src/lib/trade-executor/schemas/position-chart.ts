/**
 * zod schema for Trade Executor position chart endpoint.
 */
import { z } from 'zod';
import { positionStatisticsSchema } from './statistics';
import { performanceData, primaryKey } from './utility-types';
import { tradeExecutionSchema } from './trade';
import { createTradeInfo } from '../models/trade-info';

export const positionChartSchema = z.object({
	position_number: primaryKey,
	price_history: performanceData,
	price_history_status_message: z.string().nullish(),
	position_statistics: positionStatisticsSchema.array(),
	trades: z.array(tradeExecutionSchema.transform(createTradeInfo)),
	warnings: z.string().array().default([])
});
export type PositionChart = z.infer<typeof positionChartSchema>;
