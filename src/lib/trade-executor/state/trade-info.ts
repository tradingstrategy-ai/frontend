/**
 * Factory to create a wrapped/enriched TradeInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/trade.py
 *
 */
import type { TradeExecution } from './trade';
import type { USDollarAmount } from './utility-types';

/**
 * Prototype object that can be applied to a TradeExecution object to enrich
 * it with additional properties. Yields an object with all the properties
 * (and types) of the original plus the inherited prototype properties/types
 * (which is non-trivial with TypeScript classes)
 */
const tradeInfoPrototype = {
	// Estimate the USD value of this trade
	// `get_executed_value` in trade.py
	get executedValue(): USDollarAmount {
		const quantity = this.executed_quantity ?? 0;
		const price = this.executed_price ?? 0;
		return Math.abs(quantity) * price;
	},

	// Determine trade direction ('Buy' vs. 'Sell') based on planned_quantity
	get direction() {
		return this.planned_quantity > 0 ? 'Buy' : 'Sell';
	},

	get pricingPair() {
		return this.pair.pricingPair;
	},

	get actionLabel() {
		return `${this.direction} ${this.pricingPair.base.token_symbol}`;
	},

	get failed() {
		return this.failed_at != null;
	},

	get failedTx() {
		return this.blockchain_transactions.find((tx) => tx.revert_reason);
	},

	get isTest() {
		return this.flags?.includes('test_trade');
	},

	get positionImpact() {
		// NOTE: order of flags is significant since trades may have multiple flags
		for (const flag of ['open', 'close', 'increase', 'reduce'] as const) {
			if (this.flags?.includes(flag)) return flag;
		}
	}
} satisfies ThisType<TradeExecution & Record<string, any>>;

export type TradeInfo = TradeExecution & typeof tradeInfoPrototype;

/**
 * Factory function to create a TradeInfo object
 */
export function createTradeInfo(data: TradeExecution): TradeInfo {
	return Object.assign(Object.create(tradeInfoPrototype), data);
}
