/**
 * zod schemas for Trade Executor web chart endpoint
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/visual/web_chart.py
 *
 */
import { z } from 'zod';
import { performanceData } from './utility-types';

export const webChartType = z.enum([
	'compounding_unrealised_trading_profitability_sampled',
	'compounding_realised_profitability',
	'realised_profitability',
	'netflow',
	'total_equity',
	'share_price',
	'share_price_based_return'
]);
export type WebChartType = z.infer<typeof webChartType>;

export const webChartSource = z.enum(['live_trading', 'backtest']);
export type WebChartSource = z.infer<typeof webChartSource>;

export const webChartSchema = z.object({
	data: performanceData,
	title: z.string(),
	help_link: z.string(),
	source: webChartSource
});
export type WebChart = z.infer<typeof webChartSchema>;
