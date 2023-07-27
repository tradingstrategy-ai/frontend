import type {
  Percent,
  TokenUnits,
  TradeExecution,
  TradingPosition,
  UnixTimestamp,
  USDollarPrice, USDollarValue
} from "trade-executor-frontend/state/interface";
import type {TimeBucket} from "$lib/chart";

/**
 * Deducted data about the position to be displayed in the frontend.
 */
export interface TradingPositionInfo {

  //
  openedAt: UnixTimestamp;

  //
  closedAt?: UnixTimestamp;

  durationSeconds: UnixTimestamp;

  // Is this position still open
  stillOpen: boolean;

  // See Python get_value_at_open()
  valueAtOpen?: USDollarValue;
  quantityAtOpen?: TokenUnits;

  portfolioWeightAtOpen: Percent;

  //
  candleTimeBucket: TimeBucket;

  openPrice: USDollarPrice;

  closePrice?: USDollarPrice;

  currentPrice?: USDollarPrice;

  // The realised or unrealised profitability of the position
  realisedProfitability?: Percent;

  // The realised or unrealised profitability of the position
  unrealisedProfitability?: Percent;

  // Realised if closed, unrealised if open
  profitability?: Percent;

  estimatedMaximumRisk?: Percent;

  marketMidPriceAtOpen: USDollarPrice,

  // Is stop loss used with this position
  stopLossable: boolean;

  stopLossPrice?: USDollarValue;
  stopLossPercent?: Percent;
  stopLossTriggered: boolean;

}


/**
 * English tooltips for the datapoints
 */
export const positionInfoDescription = {
  "openedAt": "The strategy cycle decision time when the strategy decided to open this trade.",
  "closedAt": "The block timestamp when the closing trade of this position executed. This can be outside normal strategy decision making cycles when stop loss or take profit signals are triggered.",
  "durationSeconds": "How long this position was or has been open. The duration is calcualated from the open decision time to the closing trade execution time.",
  "stillOpen": "Is the position currently open.",
  "candleTimeBucket": "Which candles we use to visualise the history of this position.",
  "openPrice": "The execution price of the opening trade.",
  "closePrice": "The closing price of position.",
  "currentPrice": "The closing price of position.",
  "realisedProfitability": "The realised profitability of the position. BETA WARNING: Currently calculation may not be correct for multitrade positions.",
  "unrealisedProfitability": "The current estimated profitability of the position if closed now. BETA WARNING: Currently calculation may not be correct for multitrade positions.",
  "portfolioWeightAtOpen": "What was the position size in the terms of % total portfolio when the position was opened.",
  "valueAtOpen": "What was the position value when the position was opened.",
  "quantityAtOpen": "What was the position size in tokens when the position was opened.",
  "estimatedMaximumRisk": "How much % of the portfolio is at the risk if this position is completely lost.",
  "stopLossPercent": "Stop loss % for this position, relative to the opening price. Stop loss may be dynamic and trailing stop loss may increase over time. Calculated relative to the open price, not the current price.",
  "stopLossPrice": "Stop loss price for this position. Position is attempted closed as soon as possible if the market mid-price crosses this level.",
  "stopLossTriggered": "Stop loss was triggered for this position. Stop loss can still close at profit if a trailing stop loss or other form of dynamic stop loss was used.",
  "marketMidPriceAtOpen": "What was the market mid-price when this position was opened."
}


/**
 * Return the executed value of the trade.
 *
 * Trade can fail or in-progress in the case this function returns undefined.
 *
 */
export function calculateTradeValue(trade: TradeExecution): USDollarValue | undefined {
  if(trade.executed_price && trade.executed_quantity) {
    return trade.executed_price * trade.executed_quantity
  }
  return undefined;
}

export function extractPositionInfo(position: TradingPosition): TradingPositionInfo {

  const tradeList: TradeExecution[] = Object.values(position.trades);

  if(tradeList.length == 0) {
    throw new Error("Invalid position data without any trades");
  }

  const firstTrade: TradeExecution = tradeList[0];
  const lastTrade: TradeExecution = tradeList.at(-1);

  const openedAt = position.opened_at;
  const closedAt = position.closed_at ;
  const stillOpen = position.closed_at === null && position.frozen_at === null;
  const openPrice = firstTrade?.executed_price;
  const valueAtOpen =  calculateTradeValue(firstTrade);
  const quantityAtOpen =  firstTrade.executed_quantity;
  const portfolioWeightAtOpen = valueAtOpen / position.portfolio_value_at_open;

  let realisedProfitability = undefined;
  let unrealisedProfitability = undefined;
  let closePrice = undefined;
  let currentPrice = undefined;
  let durationSeconds;
  const currentTimestampUTC = new Date() / 1000;

  const marketMidPriceAtOpen = firstTrade.price_structure.mid_price;
  const stopLossable = position.stop_loss !== null;
  const stopLossPrice = position.stop_loss;
  const stopLossPercent = (stopLossPrice - marketMidPriceAtOpen) / marketMidPriceAtOpen;
  let stopLossTriggered = false;

  if(stillOpen) {
    durationSeconds = currentTimestampUTC - openedAt;
    currentPrice = position.last_token_price;
    unrealisedProfitability = (currentPrice - openPrice) / openPrice;
  } else {
    durationSeconds = closedAt - openedAt;
    closePrice = lastTrade.executed_price;
    // TODO: Needs to be changed avg sell - avg buy
    realisedProfitability = (closePrice - openPrice) / openPrice;

    stopLossTriggered = tradeList.some((t) => t.trade_type === 'stop_loss')
  }

  const profitability = realisedProfitability || unrealisedProfitability;
  const candleTimeBucket = durationSeconds > 7*24*3600 ? "1d" : "1h";

  return {
    openedAt,  //
    closedAt,
    stillOpen,
    durationSeconds,
    candleTimeBucket,
    openPrice,
    closePrice,
    currentPrice,
    realisedProfitability,
    unrealisedProfitability,
    profitability,
    valueAtOpen,
    quantityAtOpen,
    portfolioWeightAtOpen,
    stopLossable,
    stopLossPrice,
    stopLossPercent,
    stopLossTriggered,
    marketMidPriceAtOpen,
  }
}