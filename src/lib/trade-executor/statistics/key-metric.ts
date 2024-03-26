/**
 * zod schemas for strategy and position key metrics
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/strategy/summary.py
 *
 */
import { z } from 'zod';
import { unixTimestampToDate } from '../state/utility-types';

export const keyMetricKind = z.enum([
	'sharpe',
	'sortino',
	'max_drawdown',
	'started_at',
	'profitability',
	'total_equity',
	'last_trade',
	'trades_last_week',
	'trading_period_length',
	'return_percent',
	'annualised_return_percent',
	'cash_at_start',
	'value_at_end',
	'trade_volume',
	'position_win_percent',
	'total_positions',
	'won_positions',
	'lost_positions',
	'stop_losses_triggered',
	'stop_loss_percent_of_all',
	'stop_loss_percent_of_lost',
	'winning_stop_losses',
	'winning_stop_losses_percent',
	'losing_stop_losses',
	'losing_stop_losses_percent',
	'take_profits_triggered',
	'take_profit_percent_of_all',
	'take_profit_percent_of_won',
	'zero_profit_positions',
	'positions_open_at_the_end',
	'realised_profit_and_loss',
	'unrealised_profit_and_loss',
	'portfolio_unrealised_value',
	'extra_returns_on_lending_pool_interest',
	'cash_left_at_the_end',
	'average_winning_position_profit_percent',
	'average_losing_position_loss_percent',
	'biggest_winning_position_percent',
	'biggest_losing_position_percent',
	'average_duration_of_winning_positions',
	'average_duration_of_losing_positions',
	'average_bars_of_winning_positions',
	'average_bars_of_losing_positions',
	'lp_fees_paid',
	'lp_fees_paid_percent_of_volume',
	'average_position',
	'median_position',
	'most_consecutive_wins',
	'most_consecutive_losses',
	'biggest_realised_risk',
	'avg_realised_risk',
	'max_pullback_of_total_capital',
	'max_loss_risk_at_opening_of_position',
	'cagr'
]);
export type KeyMetricKind = z.infer<typeof keyMetricKind>;

export const keyMetricSource = z.enum(['backtesting', 'live_trading', 'missing']);

export const keyMetricCalculationMethod = z.enum(['historical_data', 'latest_value']);

export const keyMetricSchema = z.object({
	kind: keyMetricKind,
	source: keyMetricSource,
	value: z.number().nullish(),
	calculation_window_start_at: unixTimestampToDate.nullish(),
	calculation_window_end_at: unixTimestampToDate.nullish(),
	calculation_method: keyMetricCalculationMethod.nullish(),
	unavailability_reason: z.string().nullish(),
	help_link: z.string().url().nullish(),
	name: z.string().nullish()
});
export type KeyMetric = z.infer<typeof keyMetricSchema>;
