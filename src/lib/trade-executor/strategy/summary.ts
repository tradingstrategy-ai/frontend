/**
 * zod schemas for metadata endpoint
 *
 * trade-executor endpoint details:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/webhook/api.py
 *
 * zod schema based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/summary.py
 *
 * Also see
 */
import { z } from 'zod';
import {
	chainId,
	count,
	duration,
	hexString,
	percent,
	unixTimestampToDate,
	usDollarAmount
} from '../state/utility-types';
import { keyMetricSchema } from '../statistics/key-metric';
import { longShortTableSchema } from '../statistics/statistics-table';

export const assetManagementMode = z.enum(['hot_wallet', 'enzyme']);

export const enzymeSmartContractsSchema = z.object({
	vault: hexString.nullish(),
	comptroller: hexString.nullish(),
	generic_adapter: hexString.nullish(),
	gas_relay_paymaster_lib: hexString.nullish(),
	gas_relay_paymaster_factory: hexString.nullish(),
	integration_manager: hexString.nullish(),
	fund_value_calculator: hexString.nullish(),
	payment_forwarder: hexString.nullish()
});

export const onChainDataSchema = z.object({
	chain_id: chainId,
	asset_management_mode: assetManagementMode,
	smart_contracts: enzymeSmartContractsSchema
});
export type OnChainData = z.infer<typeof onChainDataSchema>;

export const performanceTupleSchema = z.tuple([unixTimestampToDate, usDollarAmount]);

export const strategySummaryStatisticsSchema = z.object({
	calculated_at: unixTimestampToDate,
	launched_at: unixTimestampToDate.nullish(),
	first_trade_at: unixTimestampToDate.nullish(),
	last_trade_at: unixTimestampToDate.nullish(),
	enough_data: z.boolean().nullish(),
	current_value: usDollarAmount.nullish(),
	profitability_90_days: percent.nullish(),
	return_all_time: percent.nullish(),
	return_annualised: percent.nullish(),
	performance_chart_90_days: performanceTupleSchema.array().nullish(),
	key_metrics: z.record(keyMetricSchema),
	backtest_metrics_cut_off_period: duration.nullish(),
	long_short_table: longShortTableSchema.nullish()
});
export type StrategySummaryStatistics = z.infer<typeof strategySummaryStatisticsSchema>;

export const strategySummarySchema = z.object({
	name: z.string(),
	short_description: z.string().nullish(),
	long_description: z.string().nullish(),
	icon_url: z.string().url().nullish(),
	on_chain_data: onChainDataSchema,
	started_at: unixTimestampToDate,
	executor_running: z.boolean(),
	frozen_positions: count,
	summary_statistics: strategySummaryStatisticsSchema,
	error_message: z.string().nullish(),
	backtest_available: z.coerce.boolean(),
	crashed_at: unixTimestampToDate.nullish(),
	badges: z.string().array(),
	tags: z.string().array()
});
export type StrategySummary = z.infer<typeof strategySummarySchema>;
