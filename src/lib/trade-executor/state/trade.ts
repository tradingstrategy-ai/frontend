/**
 * zod schemas for trades
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/trade.py
 *
 * Additional sources for specific schemas referenced below
 *
 */
import { z } from 'zod';
import {
	blockNumber,
	count,
	decimal,
	duration,
	percent,
	primaryKey,
	unixTimestamp,
	usDollarAmount,
	usDollarPrice
} from './utility-types';
import { assetIdentifierSchema, tradingPairIdentifierSchema } from './identifier';
import { blockchainTransactionSchema } from './blockchain-transaction';
import { loanSchema } from './loan';

export const tradeType = z.enum(['rebalance', 'stop_loss', 'take_profit', 'repair', 'accounting_correction']);

export const tradeStatus = z.enum([
	'planned',
	'started',
	'broadcasted',
	'success',
	'failed',
	'repaired',
	'repair_entry'
]);

export const tradeFlag = z.enum(['open', 'close', 'increase', 'reduce', 'close_protocol_last', 'test_trade']);

// see: https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/trade_pricing.py
export const tradePricingSchema = z.object({
	price: usDollarPrice,
	mid_price: usDollarPrice,
	lp_fee: usDollarAmount.array().nullish(),
	pair_fee: percent.array().nullish(),
	market_feed_delay: unixTimestamp.nullish(),
	side: z.boolean().nullish(),
	path: tradingPairIdentifierSchema.array().nullish(),
	read_at: unixTimestamp.nullish(),
	block_number: blockNumber.nullish(),
	token_in: decimal.nullish(),
	token_out: decimal.nullish()
});

export const tradeExecutionSchema = z.object({
	trade_id: primaryKey,
	position_id: primaryKey,
	trade_type: tradeType,
	pair: tradingPairIdentifierSchema,
	opened_at: unixTimestamp.nullable(),
	planned_quantity: decimal,
	planned_reserve: decimal,
	planned_price: usDollarPrice,
	reserve_currency: assetIdentifierSchema,
	route: z.string().nullish(),
	flags: tradeFlag.array().nullish(),
	planned_collateral_allocation: decimal.nullish(),
	executed_collateral_allocation: decimal.nullish(),
	planned_collateral_consumption: decimal.nullish(),
	executed_collateral_consumption: decimal.nullish(),
	reserve_currency_exchange_rate: usDollarPrice.nullish(),
	planned_mid_price: usDollarPrice.nullish(),
	planned_max_slippage: percent.nullish(),
	started_at: unixTimestamp.nullish(),
	reserve_currency_allocated: decimal.nullish(),
	broadcasted_at: unixTimestamp.nullish(),
	executed_at: unixTimestamp.nullish(),
	failed_at: unixTimestamp.nullish(),
	executed_price: usDollarPrice.nullish(),
	executed_quantity: decimal.nullish(),
	executed_reserve: decimal.nullish(),
	slippage_tolerance: percent.nullish(),
	fee_tier: percent.nullish(),
	lp_fees_paid: usDollarAmount.nullish(),
	lp_fees_estimated: usDollarAmount.nullish(),
	lp_fee_exchange_rate: usDollarPrice.nullish(),
	native_token_price: usDollarPrice.nullish(),
	retry_of: primaryKey.nullish(),
	blockchain_transactions: blockchainTransactionSchema.array(),
	notes: z.string().nullish(),
	repaired_at: unixTimestamp.nullish(),
	repaired_trade_id: primaryKey.nullish(),
	price_structure: tradePricingSchema.nullish(),
	post_execution_price_structure: tradePricingSchema.nullish(),
	cost_of_gas: decimal.nullish(),
	portfolio_value_at_creation: usDollarAmount.nullish(),
	leverage: z.number().nullish(),
	planned_loan_update: loanSchema.nullish(),
	executed_loan_update: loanSchema.nullish(),
	claimed_interest: decimal.nullish(),
	paid_interest: decimal.nullish(),
	exchange_name: z.string().nullish()
});

// see: https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/analysis/trade_analyser.py
export const tradeSummarySchema = z.object({
	won: count,
	lost: count,
	zero_loss: count,
	stop_losses: count,
	undecided: count,
	realised_profit: usDollarAmount,
	open_value: usDollarAmount,
	uninvested_cash: usDollarAmount,
	initial_cash: usDollarAmount.nullish(),
	extra_return: usDollarAmount,
	duration: duration.nullish(),
	average_winning_trade_profit_pc: percent.nullish(),
	average_losing_trade_loss_pc: percent.nullish(),
	biggest_winning_trade_pc: percent.nullish(),
	biggest_losing_trade_pc: percent.nullish(),
	average_duration_of_winning_trades: duration,
	average_duration_of_losing_trades: duration,
	time_bucket: z.string().nullish(),
	total_positions: count,
	win_percent: percent.nullish(),
	lost_percent: percent.nullish(),
	return_percent: percent.nullish(),
	annualised_return_percent: percent.nullish(),
	all_stop_loss_percent: percent.nullish(),
	lost_stop_loss_percent: percent.nullish(),
	all_take_profit_percent: percent.nullish(),
	won_take_profit_percent: percent.nullish(),
	average_net_profit: usDollarAmount.nullish(),
	end_value: usDollarAmount,
	average_trade: percent.nullish(),
	median_trade: percent.nullish(),
	max_pos_cons: count.nullish(),
	max_neg_cons: count.nullish(),
	max_pullback: percent.nullish(),
	max_loss_risk: percent.nullish(),
	max_realised_loss: percent.nullish(),
	avg_realised_risk: percent.nullish(),
	take_profits: count,
	trade_volume: usDollarAmount,
	lp_fees_paid: usDollarPrice.nullish(),
	lp_fees_average_pc: usDollarPrice.nullish(),
	// skipping daily_returns for now
	// daily_returns: pandasSeries.nullish(),
	winning_stop_losses: count.nullish(),
	losing_stop_losses: count.nullish(),
	winning_take_profits: count.nullish(),
	losing_take_profits: count.nullish(),
	winning_stop_losses_percent: percent.nullish(),
	losing_stop_losses_percent: percent.nullish(),
	winning_take_profits_percent: percent.nullish(),
	losing_take_profits_percent: percent.nullish(),
	median_win: percent.nullish(),
	median_loss: percent.nullish(),
	sharpe_ratio: z.number().nullish(),
	sortino_ratio: z.number().nullish(),
	profit_factor: z.number().nullish(),
	max_drawdown: percent.nullish(),
	max_runup: percent.nullish(),
	average_duration_of_zero_loss_trades: duration.nullish(),
	average_duration_of_all_trades: duration.nullish(),
	unrealised_profit: usDollarAmount.nullish()
});
