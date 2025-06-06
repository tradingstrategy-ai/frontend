/**
 * Factory to create a wrapped/enriched TradingPositionInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/position.py
 *
 */
import type { Percent, PrimaryKeyString, USDollarAmount, USDollarPrice } from '../schemas/utility-types';
import type { State } from '../schemas/state';
import type { PositionStatistics } from '../schemas/statistics';
import type { PositionStatus, TradingPosition } from '../schemas/position';
import type { TimeBucket } from '$lib/schemas/utility';
import { type TradeDirection, TradeDirections } from './trade-info';
import { isNumber } from '$lib/helpers/formatters';

export const createTradingPositionInfo = <T extends TradingPosition>(base: T, stats: PositionStatistics[] = []) => ({
	...base,

	stats,

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

	get entryTrade() {
		return this.trades.find((t) => !t.failed && t.direction === TradeDirections.Enter);
	},

	get exitTrade() {
		if (!this.closed) return;
		return this.trades.findLast((t) => !t.failed && t.direction === TradeDirections.Exit);
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
		return !this.closed && !this.frozen;
	},

	get frozen() {
		return Boolean(this.frozen_at && !this.unfrozen_at);
	},

	get multitrade() {
		const tradeCount = this.trades.length - this.failedTrades.length;
		return this.closed ? tradeCount > 2 : tradeCount > 1;
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
	 * Return the current value based `price * quantity` if sold on unobtainable theoretical price
	 */
	get nominalValue() {
		if (isNumber(this.currentPrice) && isNumber(this.currentQuantity)) {
			return this.currentPrice * this.currentQuantity;
		}
	},

	/**
	 * Percentage difference between realizable value and nominal value.
	 * Negative when realizable is lower (which is expected).
	 */
	get valueRealizationGap() {
		if (isNumber(this.currentValue) && this.nominalValue) {
			return this.currentValue / this.nominalValue - 1;
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
			return this.lastTrade!.executedValue;
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

	get stopLossTriggered() {
		return this.lastTrade?.isStopLoss ?? false;
	},

	get trailingStopLossPrice(): USDollarPrice | undefined {
		if (this.trailing_stop_loss_pct == null) return;
		const lastTriggerUpdate = this.trigger_updates.at(-1);
		return lastTriggerUpdate?.stop_loss_after ?? undefined;
	},

	get isTrailingStopLoss() {
		return (
			this.trailing_stop_loss_pct != null &&
			this.stopLossTriggered &&
			this.trigger_updates.some((tu) => tu.stop_loss_after != null)
		);
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

	// return sum of all trade values for a given direction (enter = 1 or exit = -1)
	valueForTradeDirection(direction: TradeDirection) {
		return this.trades.reduce((acc, t) => {
			if (t.direction === direction) acc += t.executedValue;
			return acc;
		}, 0);
	},

	get totalEnteredValue() {
		return this.valueForTradeDirection(TradeDirections.Enter);
	},

	get totalExitedValue() {
		return this.valueForTradeDirection(TradeDirections.Exit);
	},

	get profitabilityFromTradeTotals() {
		if (!this.closed) return;

		const totalEntered = this.totalEnteredValue;
		const totalExited = this.totalExitedValue;
		let profitability = (totalExited - totalEntered) / totalEntered;
		if (this.isShortPosition) profitability *= -1;
		return isNumber(profitability) ? profitability : 0;
	},

	get hasInconsistentProfitability() {
		const fromStats = this.profitability;
		const fromTradeTotals = this.profitabilityFromTradeTotals;

		if (!this.closed || fromStats === undefined || fromTradeTotals === undefined) {
			return false;
		}

		const difference = fromTradeTotals - fromStats;
		const percentChange = difference / fromStats;
		return Math.abs(percentChange) > 0.01 && Math.abs(difference) > 0.001;
	},

	get candleTimeBucket(): TimeBucket {
		return this.durationSeconds > 7 * 24 * 3600 ? '1d' : '1h';
	},

	get isCreditPosition() {
		return this.pair.isCreditSupply;
	},

	get isShortPosition() {
		return this.pair.isShort;
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
	},

	toJSON() {
		return {
			position_id: this.position_id,
			opened_at: this.opened_at,
			closed_at: this.closed_at,
			value_at_open: this.valueAtOpen,
			value_at_close: this.valueAtClose,
			open_price: this.openPrice,
			close_price: this.closePrice,
			profitability: this.profitability,
			kind: this.pricingPair.kindShortLabel,
			symbol: this.pricingPair.symbol
		};
	}
});

export type TradingPositionInfo = ReturnType<typeof createTradingPositionInfo<TradingPosition>>;

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
export function getTradingPositionInfoArray(state: State, status: PositionStatus) {
	const positions = state.portfolio[`${status}_positions`];
	return Object.values(positions).map((position) => {
		const stats = state.stats.positions[position.position_id];
		return createTradingPositionInfo(position, stats);
	});
}
