/**
 * Factory to create a wrapped/enriched TradeInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/trade.py
 *
 */
import type { TradeExecution } from './trade';
import type { USDollarAmount } from './utility-types';

export const TradeDirections = {
	Enter: 1,
	Exit: -1,
	Unknown: 0
} as const;

export type TradeDirection = (typeof TradeDirections)[keyof typeof TradeDirections];

export const createTradeInfo = <T extends TradeExecution>(base: T) => ({
	...base,

	// Estimate the USD value of trade
	// see: get_executed_value in trade.py
	get executedValue(): USDollarAmount {
		const quantity = this.executed_quantity ?? 0;
		const price = this.executed_price ?? 0;
		return Math.abs(quantity) * price;
	},

	// Planned USD value of trade
	// see: get_planned_value in trade.py
	get plannedValue() {
		return Math.abs(this.planned_quantity) * this.planned_price;
	},

	// Estimated or realised USD value of trade
	// see: get_value in trade.py
	get value() {
		if (this.repaired_at) {
			return 0;
		} else if (this.executed_at) {
			return this.executedValue;
		} else if (this.failed_at || this.started_at) {
			return this.plannedValue;
		} else {
			return 0;
		}
	},

	// Determine trade direction based on planned_quantity +/-
	// (reversed for short positions)
	get direction() {
		let dir = Math.sign(this.planned_quantity);
		if (this.isShortTrade) dir *= -1;
		return dir as TradeDirection;
	},

	get directionLabel() {
		// reverse Buy/Sell labels for short trades
		const dir = (this.direction * (this.isShortTrade ? -1 : 1)) as TradeDirection;

		// Credit supply labels
		if (this.isCreditTrade) {
			return {
				[TradeDirections.Enter]: 'Supply',
				[TradeDirections.Exit]: 'Withdraw',
				[TradeDirections.Unknown]: 'Unknown'
			}[dir];
		}

		// All other trade types
		return {
			[TradeDirections.Enter]: 'Buy',
			[TradeDirections.Exit]: 'Sell',
			[TradeDirections.Unknown]: 'Unknown'
		}[dir];
	},

	get pricingPair() {
		return this.pair.pricingPair;
	},

	get actionLabel() {
		return `${this.directionLabel} ${this.pair.actionSymbol}`;
	},

	get isCreditTrade() {
		return this.pair.isCreditSupply;
	},

	get isShortTrade() {
		return this.pair.isShort;
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
		// order of flags is significant since trades may have multiple flags
		const impacts = ['open', 'close', 'increase', 'reduce'] as const;
		// return first matching impact flag (if any)
		return impacts.find((flag) => this.flags?.includes(flag));
	}
});

export type TradeInfo = ReturnType<typeof createTradeInfo<TradeExecution>>;
