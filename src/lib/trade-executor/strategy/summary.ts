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

export const assetManagementMode = z.enum(['hot_wallet', 'enzyme']);

export const enzymeSmartContractsSchema = z.object({
	vault: hexString.nullish(),
	comptroller: hexString.nullish(),
	generic_adapter: hexString.nullish(),
	gas_relay_paymaster_lib: hexString.nullish(),
	gas_relay_paymaster_factory: hexString.nullish(),
	integration_manager: hexString.nullish(),
	fund_value_calculator: hexString.nullish(),
	payment_forwarder: hexString.nullish(),
	guard: hexString.nullish(),
	terms_of_service: hexString.nullish()
});
export type EnzymeSmartContracts = z.infer<typeof enzymeSmartContractsSchema>;

export const onChainDataSchema = z.object({
	chain_id: chainId.nullish(),
	asset_management_mode: assetManagementMode,
	smart_contracts: enzymeSmartContractsSchema,
	owner: hexString.nullish(),
	trade_executor_hot_wallet: hexString.nullish()
});
export type OnChainData = z.infer<typeof onChainDataSchema>;

export const performanceTupleSchema = z.tuple([unixTimestampToDate, usDollarAmount]);

// See `calculate_key_metrics` in:
// https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/statistics/key_metric.py
export const summaryKeyMetricKind = z.enum([
	'sharpe',
	'sortino',
	'max_drawdown',
	'profitability',
	'cagr',
	'trades_per_month',
	'total_equity',
	'started_at',
	'last_trade',
	'trades_last_week'
]);
export type SummaryKeyMetricKind = z.infer<typeof summaryKeyMetricKind>;

const summaryKeyMetricEntries = summaryKeyMetricKind.options.map((kind) => {
	return [kind, keyMetricSchema.extend({ kind: z.literal(kind) })];
});

const summaryKeyMetricsSchema = z
	.object(Object.fromEntries(summaryKeyMetricEntries))
	.partial()
	.catchall(keyMetricSchema);
export type SummaryKeyMetrics = z.infer<typeof summaryKeyMetricsSchema>;

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
	compounding_unrealised_trading_profitability: performanceTupleSchema.array().nullish(),
	performance_chart_90_days: performanceTupleSchema.array().nullish(),
	key_metrics: summaryKeyMetricsSchema,
	backtest_metrics_cut_off_period: duration.nullish()
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
	tags: z.string().array(),
	sort_priority: z.number().default(0)
});
export type StrategySummary = z.infer<typeof strategySummarySchema>;
