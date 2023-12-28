/**
 * Factor to create a wrapped/enriched TradeInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/trade.py
 *
 */
import type { TradeExecution } from './trade';
import type { USDollarAmount } from './utility-types';

export function createTradeInfo(data: TradeExecution) {
	return {
		...data,

		// Estimate the USD value of this trade
		// `get_executed_value` in trade.py
		get executedValue(): USDollarAmount {
			const quantity = data.executed_quantity ?? 0;
			const price = data.executed_price ?? 0;
			return Math.abs(quantity) * price;
		},

		// Determine trade direction ('Buy' vs. 'Sell') based on planned_quantity
		// TODO: replace with method that supports trade flags (open, close, increase, reduce, etc.)
		get direction() {
			return data.planned_quantity > 0 ? 'Buy' : 'Sell';
		},

		get failed() {
			return data.failed_at != null;
		},

		get failedTx() {
			return data.blockchain_transactions.find((tx) => tx.revert_reason);
		}
	};
}

export type TradeInfo = ReturnType<typeof createTradeInfo>;
