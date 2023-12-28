import type { Percent, USDollarAmount, USDollarPrice } from './utility-types';
import type { TradingPosition } from './position';
import type { TimeBucket } from '$lib/chart';
import { createTradeInfo } from './trade-info';

/**
 * English tooltips for the datapoints
 */
const tooltips: Record<string, string> = {
	openedAt: 'The strategy cycle decision time when the strategy decided to open this trade.',
	closedAt:
		'The block timestamp when the closing trade of this position executed. This can be outside normal strategy decision making cycles when stop loss or take profit signals are triggered.',
	durationSeconds:
		'How long this position was or has been open. The duration is calcualated from the open decision time to the closing trade execution time.',
	stillOpen: 'Is the position currently open.',
	candleTimeBucket: 'Which candles we use to visualise the history of this position.',
	openPrice: 'The execution price of the opening trade.',
	closePrice: 'The closing price of position.',
	currentPrice: 'The closing price of position.',
	realisedProfitability:
		'The realised profitability of the position. BETA WARNING: Currently calculation may not be correct for multitrade positions.',
	unrealisedProfitability:
		'The current estimated profitability of the position if closed now. BETA WARNING: Currently calculation may not be correct for multitrade positions.',
	portfolioWeightAtOpen: 'What was the position size in the terms of % total portfolio when the position was opened.',
	valueAtOpen: 'What was the position value when the position was opened.',
	quantityAtOpen: 'What was the position size in tokens when the position was opened.',
	estimatedMaximumRisk: 'How much % of the portfolio is at the risk if this position is completely lost.',
	stopLossPercentOpen:
		'Stop loss % for this position, relative to the opening price. Stop loss may be dynamic and trailing stop loss may increase over time. BETA WARNING: Currently calculated relative to the open price, not the current price.',
	stopLossPercentOpenMissing: 'Stop loss not used at the position open or the value was not recorded',
	stopLossPrice:
		'Stop loss price for this position. Position is attempted closed as soon as possible if the market mid-price crosses this level.',
	stopLossTriggered:
		'Stop loss was triggered for this position. Stop loss can still close at profit if a trailing stop loss or other form of dynamic stop loss was used.',
	marketMidPriceAtOpen: 'What was the market mid-price when this position was opened.',
	trailingStopLossPercent: 'If trailing stop loss was turned on, what was its value relative to the position value.',
	portfolioRiskPercent:
		'Maximum portfolio % value at a risk when the position was opened. This risk assumes any stop losses can be executed without significant price impact or slippage.',
	portfolioRiskPercentMissing: 'Stop loss data not recorded or stop loss was not used and cannot calculate this value.',
	volume: 'How much trading volume trades of this position have generated',
	tradingFees: 'How much trading fees were total. This includes protocol fees and liquidity provider fees',
	tradingFeesMissing: 'Trading fee data was not recorded for this position',
	tradingFeesPercent:
		'How much trading fees were % of trading volume. This includes protocol fees and liquidity provider fees'
};

export class TradingPositionInfo {
	constructor(protected data: TradingPosition) {}

	tooltip(key: string) {
		return tooltips[key];
	}

	get id() {
		return this.data.position_id;
	}

	get openedAt() {
		return this.data.opened_at;
	}

	get closedAt() {
		return this.data.closed_at;
	}

	get frozenAt() {
		return this.data.frozen_at;
	}

	get durationSeconds() {
		const endDate = this.closedAt ?? Date.now();
		return (+endDate - +this.openedAt) / 1000;
	}

	get pair() {
		return this.data.pair;
	}

	get trades() {
		return Object.values(this.data.trades).map(createTradeInfo);
	}

	get firstTrade() {
		return this.trades[0];
	}

	get lastTrade() {
		return this.trades.at(-1);
	}

	get failedOpen() {
		return this.firstTrade.failed_at != null;
	}

	get closed() {
		return this.closedAt != null;
	}

	get stillOpen() {
		return this.closedAt == null && this.frozenAt == null;
	}

	get frozen() {
		return Boolean(this.frozenAt && !this.data.unfrozen_at);
	}

	get openPrice() {
		return this.firstTrade.executed_price;
	}

	get valueAtOpen() {
		return this.firstTrade.executedValue;
	}

	get quantityAtOpen() {
		return Math.abs(this.firstTrade.executed_quantity ?? 0);
	}

	get portfolioWeightAtOpen(): Percent | undefined {
		if (this.valueAtOpen && this.data.portfolio_value_at_open) {
			return this.valueAtOpen / this.data.portfolio_value_at_open;
		}
	}

	get marketMidPriceAtOpen() {
		return this.firstTrade.price_structure?.mid_price;
	}

	get stopLossable() {
		return this.data.stop_loss != null;
	}

	get stopLossPriceOpen(): USDollarPrice | undefined {
		const tu = this.data.trigger_updates.find((tu) => tu.stop_loss_before);
		return tu?.stop_loss_before ?? this.data.stop_loss ?? undefined;
	}

	get trailingStopLossPercent() {
		return this.data.trailing_stop_loss_pct;
	}

	get stopLossPercentOpen(): Percent | undefined {
		if (this.stopLossPriceOpen && this.marketMidPriceAtOpen) {
			const percentOpen = this.stopLossPriceOpen / this.marketMidPriceAtOpen;
			return percentOpen < 1 ? percentOpen : undefined;
		}
	}

	get currentPrice() {
		return this.stillOpen ? this.data.last_token_price : undefined;
	}

	get unrealisedProfitability(): Percent | undefined {
		if (this.openPrice && this.currentPrice) {
			return (this.currentPrice - this.openPrice) / this.openPrice;
		}
	}

	get closePrice() {
		return this.closed ? this.lastTrade?.executed_price : undefined;
	}

	// TODO: Needs to be changed avg sell - avg buy
	get realisedProfitability(): Percent | undefined {
		if (this.openPrice && this.closePrice) {
			return (this.closePrice - this.openPrice) / this.openPrice;
		}
	}

	get profitability() {
		return this.realisedProfitability ?? this.unrealisedProfitability;
	}

	get stopLossTriggered() {
		return this.stillOpen && this.trades.some((t) => t.trade_type === 'stop_loss');
	}

	get candleTimeBucket(): TimeBucket {
		return this.durationSeconds > 7 * 24 * 3600 ? '1d' : '1h';
	}

	get portfolioRiskPercent(): Percent | undefined {
		if (this.stopLossPercentOpen && this.portfolioWeightAtOpen) {
			return (1 - this.stopLossPercentOpen) * this.portfolioWeightAtOpen;
		}
	}

	get volume(): USDollarAmount {
		return this.trades.reduce((acc, t) => {
			return acc + t.executedValue;
		}, 0);
	}

	get tradingFees(): USDollarAmount {
		return this.trades.reduce((acc, t) => {
			return acc + (t.lp_fees_paid ?? 0);
		}, 0);
	}

	get tradingFeesPercent(): Percent | undefined {
		if (this.volume) {
			return this.tradingFees / this.volume;
		}
	}

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
			positionId: this.id,
			tradeId: lastFailedTrade.trade_id,
			revertReason: failedTx.revert_reason!,
			txHash: failedTx.tx_hash!
		};
	}
}
