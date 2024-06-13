/**
 * Factory to create a wrapped/enriched TradingPositionInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/position.py
 *
 */
import type { Percent, PrimaryKeyString, USDollarAmount, USDollarPrice } from './utility-types';
import type { State } from './state';
import type { PositionStatistics } from './statistics';
import type { TimeBucket } from '$lib/chart';
import { type PositionStatus, type TradingPosition, tradingPositionTooltips } from './position';

/**
 * English tooltips for the datapoints
 */
export const tradingPositionInfoTooltips = {
	...tradingPositionTooltips,
	durationSeconds:
		'How long this position was or has been open. The duration is calcualated from the open decision time to the closing trade execution time.',
	stillOpen: 'Is the position currently open.',
	candleTimeBucket: 'Which candles we use to visualise the history of this position.',
	openPrice: 'The execution price of the opening trade.',
	closePrice: 'The closing price of the position.',
	currentPrice: 'The latest recorded price of the position.',
	interestRateAtOpen: 'The opening interest rate of the position.',
	interestRateAtClose: 'Closing interest rate is not currently available.',
	currentInterestRate: 'The latest recorded interest rate of the position.',
	realisedProfitability:
		'The realised profitability of the position. BETA WARNING: Currently calculation may not be correct for multitrade positions.',
	unrealisedProfitability:
		'The current estimated profitability of the position if closed now. BETA WARNING: Currently calculation may not be correct for multitrade positions.',
	portfolioWeightAtOpen: 'The position size in the terms of % total portfolio when the position was opened.',
	valueAtOpen: 'The position value when the position was opened.',
	valueAtClose: 'The position value when the position was closed.',
	currentValue: 'The last recorded value of the position.',
	quantityAtOpen: 'The position size in tokens when the position was opened.',
	quantityAtClose: 'The position size in tokens when the position was closed.',
	currentQuantity: 'The latest recorded position size in tokens.',
	estimatedMaximumRisk: 'How much % of the portfolio is at the risk if this position is completely lost.',
	stopLossPercentOpen:
		'Stop loss % for this position, relative to the opening price. Stop loss may be dynamic and trailing stop loss may increase over time. BETA WARNING: Currently calculated relative to the open price, not the current price.',
	stopLossPercentOpenMissing: 'Stop loss not used at the position open or the value was not recorded',
	stopLossPrice:
		'Stop loss price for this position. Position is attempted closed as soon as possible if the market mid-price crosses this level.',
	stopLossTriggered:
		'Stop loss was triggered for this position. Stop loss can still close at profit if a trailing stop loss or other form of dynamic stop loss was used.',
	marketMidPriceAtOpen: 'What was the market mid-price when this position was opened.',
	portfolioRiskPercent:
		'Maximum portfolio % value at a risk when the position was opened. This risk assumes any stop losses can be executed without significant price impact or slippage.',
	portfolioRiskPercentMissing: 'Stop loss data not recorded or stop loss was not used and cannot calculate this value.',
	volume: 'How much trading volume trades of this position have generated',
	tradingFees: 'How much trading fees were total. This includes protocol fees and liquidity provider fees',
	tradingFeesMissing: 'Trading fee data was not recorded for this position',
	tradingFeesPercent:
		'How much trading fees were % of trading volume. This includes protocol fees and liquidity provider fees'
};

type TradingPositionWithStats = TradingPosition & {
	stats: PositionStatistics[];
};

/**
 * Prototype object that can be applied to a TradingPosition object to enrich
 * it with additional properties. Yields an object with all the properties
 * (and types) of the original plus the inherited prototype properties/types
 * (which is non-trivial with TypeScript classes)
 */
const tradingPositionInfoPrototype = {
	tooltip: tradingPositionInfoTooltips,

	get durationSeconds() {
		const endDate = this.closed_at ?? Date.now();
		return (+endDate - +this.opened_at) / 1000;
	},

	get pricingPair() {
		return this.pair.pricingPair;
	},

	get firstTrade() {
		return this.trades[0];
	},

	get lastTrade() {
		return this.trades.at(-1);
	},

	get latestStats() {
		return this.stats.at(-1);
	},

	get lastStatsBeforeClose() {
		// confirm position is closed and final stats have been calculated
		if (this.closed && this.latestStats && this.closed_at! < this.latestStats.calculated_at) {
			return this.stats.at(-2);
		}
	},

	get failedOpen() {
		return this.firstTrade.failed;
	},

	get closed() {
		return this.closed_at != null;
	},

	get stillOpen() {
		return this.closed_at == null && this.frozen_at == null;
	},

	get frozen() {
		return Boolean(this.frozen_at && !this.unfrozen_at);
	},

	get openPrice() {
		return this.firstTrade.executed_price;
	},

	/**
	 * Return the value based on the latest pre-calculated position stats
	 */
	get currentValue() {
		if (this.stillOpen) {
			return this.latestStats?.value;
		}
	},

	/**
	 * Return the value calculated when the position was opened
	 */
	get valueAtOpen() {
		return this.firstTrade.executedValue;
	},

	/**
	 * Return the value calculated when the position was closed
	 */
	get valueAtClose() {
		if (this.closed) {
			return this.lastTrade.executedValue;
		}
	},

	/**
	 * Return the the highest calculated position value
	 */
	get valueAtPeak() {
		return Math.max(...this.stats.map((s) => s.value));
	},

	get quantityAtOpen() {
		const quantity = this.stats[0]?.quantity;
		return quantity && Math.abs(quantity);
	},

	get quantityAtClose() {
		return this.lastStatsBeforeClose?.quantity;
	},

	get currentQuantity() {
		if (this.stillOpen) {
			return this.latestStats?.quantity;
		}
	},

	get portfolioWeightAtOpen(): Percent | undefined {
		if (this.valueAtOpen && this.portfolio_value_at_open) {
			return this.valueAtOpen / this.portfolio_value_at_open;
		}
	},

	get marketMidPriceAtOpen() {
		return this.firstTrade.price_structure?.mid_price;
	},

	get stopLossable() {
		return this.stop_loss != null;
	},

	get stopLossPriceOpen(): USDollarPrice | undefined {
		const tu = this.trigger_updates.find((tu) => tu.stop_loss_before);
		return tu?.stop_loss_before ?? this.stop_loss ?? undefined;
	},

	get stopLossPercentOpen(): Percent | undefined {
		if (this.stopLossPriceOpen && this.marketMidPriceAtOpen) {
			const percentOpen = this.stopLossPriceOpen / this.marketMidPriceAtOpen;
			return percentOpen < 1 ? percentOpen : undefined;
		}
	},

	get stopLossTrades() {
		return this.trades.filter((t) => t.trade_type === 'stop_loss');
	},

	get stopLossTriggered() {
		return this.stopLossTrades.length > 0;
	},

	get currentPrice() {
		return this.stillOpen ? this.last_token_price : undefined;
	},

	get closePrice() {
		return this.closed ? this.lastTrade?.executed_price : undefined;
	},

	get profitability() {
		return this.latestStats?.profitability;
	},

	get candleTimeBucket(): TimeBucket {
		return this.durationSeconds > 7 * 24 * 3600 ? '1d' : '1h';
	},

	get isCreditPosition() {
		return this.pair.isCreditSupply;
	},

	get interestRateAtOpen() {
		return this.loan?.collateral.interest_rate_at_open;
	},

	get currentInterestRate() {
		return this.loan?.collateral.last_interest_rate;
	},

	get portfolioRiskPercent(): Percent | undefined {
		if (this.stopLossPercentOpen && this.portfolioWeightAtOpen) {
			return (1 - this.stopLossPercentOpen) * this.portfolioWeightAtOpen;
		}
	},

	get volume(): USDollarAmount {
		return this.trades.reduce((acc, t) => {
			return acc + t.executedValue;
		}, 0);
	},

	get tradingFees(): USDollarAmount {
		return this.trades.reduce((acc, t) => {
			return acc + (t.lp_fees_paid ?? 0);
		}, 0);
	},

	get tradingFeesPercent(): Percent | undefined {
		if (this.volume) {
			return this.tradingFees / this.volume;
		}
	},

	get failedTrades() {
		return this.trades.filter((t) => t.failed);
	},

	get hasFailedTrades() {
		return this.failedTrades.length > 0;
	},

	/**
	 * Get the last failed trade reason.
	 *
	 * Note: still returns freeze reason after position has been unfrozen
	 */
	get freezeReason() {
		const lastFailedTrade = this.trades.findLast((t) => t.failed);
		const failedTx = lastFailedTrade?.failedTx;

		if (!failedTx) return;

		return {
			chainId: failedTx.chain_id,
			positionId: this.position_id,
			tradeId: lastFailedTrade.trade_id,
			revertReason: failedTx.revert_reason!,
			txHash: failedTx.tx_hash!
		};
	},

	// If any trades are test trades, this is a test position
	// (ALL trades SHOULD be test trades if ANY are)
	get isTest() {
		return this.trades.some((t) => t.isTest);
	}
} satisfies ThisType<TradingPositionWithStats & Record<string, any>>;

export type TradingPositionInfo = TradingPositionWithStats & typeof tradingPositionInfoPrototype;

/**
 * Factory function to create a TradingPositionInfo object
 */
export function createTradingPositionInfo(
	position: TradingPosition,
	stats: PositionStatistics[] = []
): TradingPositionInfo {
	const positionInfo = Object.create(tradingPositionInfoPrototype);
	return Object.assign(positionInfo, position, { stats });
}

/**
 * Get a single TradingPositionInfo object from state for a given status and id
 */
export function getTradingPositionInfo(state: State, status: PositionStatus, id: PrimaryKeyString) {
	const position = state.portfolio[`${status}_positions`][id];
	if (!position) return;
	const stats = state.stats.positions[id] ?? [];
	return createTradingPositionInfo(position, stats);
}

/**
 * Get all TradingPositionInfo objects from state for a given status
 */
export function getTradingPositionInfoArray(state: State, status: PositionStatus): TradingPositionInfo[] {
	const positions = state.portfolio[`${status}_positions`];
	return Object.values(positions).map((position) => {
		const stats = state.stats.positions[position.position_id];
		return createTradingPositionInfo(position, stats);
	});
}
