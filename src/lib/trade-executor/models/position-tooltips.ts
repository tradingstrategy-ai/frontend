/**
 * English tooltips for trading position properties and getters
 */
export const positionTooltips = {
	// Properties - see ./position.ts
	opened_at: 'The strategy cycle decision time when the strategy decided to open this trade.',
	closed_at:
		'The block timestamp when the closing trade of this position executed. This can be outside normal strategy decision making cycles when stop loss or take profit signals are triggered.',
	trailing_stop_loss_pct: 'If trailing stop loss was turned on, what was its value relative to the position value.',

	// Getters - see ./position-info.ts
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
} as const;
