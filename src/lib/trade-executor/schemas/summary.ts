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
import { chainId, count, duration, hexString, percent, unixTimestampToDate, usDollarAmount } from './utility-types';
import { keyMetricSchema } from './key-metric';

export const enzymeSmartContractsSchema = z.object({
	vault: hexString,
	comptroller: hexString,
	fund_value_calculator: hexString,
	payment_forwarder: hexString,
	terms_of_service: hexString.nullish()
});
export type EnzymeSmartContracts = z.infer<typeof enzymeSmartContractsSchema>;

export const velvetSmartContractSchema = z.object({
	portfolio: hexString,
	symbol: z.string(),
	feeModule: hexString,
	vaultAddress: hexString,
	depositManager: hexString,
	withdrawManager: hexString
});
export type VelvetSmartContracts = z.infer<typeof velvetSmartContractSchema>;

export const lagoonSmartContractSchema = z.object({
	address: hexString,
	feeReceiver: hexString,
	feeRegistry: hexString,
	valuationManager: hexString,
	safe: hexString,
	asset: hexString
});
export type LagoonSmartContracts = z.infer<typeof lagoonSmartContractSchema>;

export type SmartContracts = EnzymeSmartContracts | VelvetSmartContracts | LagoonSmartContracts;

const baseOnChainDataSchema = z.object({
	chain_id: chainId,
	owner: hexString.nullish(),
	trade_executor_hot_wallet: hexString.nullish()
});

const hotWalletSchema = baseOnChainDataSchema.extend({
	asset_management_mode: z.literal('hot_wallet'),
	smart_contracts: z.object({})
});

const enzymeSchema = baseOnChainDataSchema.extend({
	asset_management_mode: z.literal('enzyme'),
	smart_contracts: enzymeSmartContractsSchema
});
export type EnzymeOnChainData = z.infer<typeof enzymeSchema>;

const velvetSchema = baseOnChainDataSchema.extend({
	asset_management_mode: z.literal('velvet'),
	smart_contracts: velvetSmartContractSchema
});

const lagoonSchema = baseOnChainDataSchema.extend({
	asset_management_mode: z.literal('lagoon'),
	smart_contracts: lagoonSmartContractSchema
});

export const onChainDataSchema = z.discriminatedUnion('asset_management_mode', [
	hotWalletSchema,
	enzymeSchema,
	velvetSchema,
	lagoonSchema
]);
export type OnChainData = z.infer<typeof onChainDataSchema>;

// narrowed version of OnChainData that only includes vaults (excludes hot_wallet)
export type VaultOnChainData = OnChainData & {
	asset_management_mode: Exclude<OnChainData['asset_management_mode'], 'hot_wallet'>;
};

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
	'trades_last_week',
	'decision_cycle_duration'
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

export const strategyFeesSchema = z.object({
	management_fee: percent.default(0),
	trading_strategy_protocol_fee: percent.default(0),
	strategy_developer_fee: percent.default(0)
});
export type StrategyFees = z.infer<typeof strategyFeesSchema>;

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
	sort_priority: z.number().default(0),
	fees: strategyFeesSchema.default({})
});
export type StrategySummary = z.infer<typeof strategySummarySchema>;
