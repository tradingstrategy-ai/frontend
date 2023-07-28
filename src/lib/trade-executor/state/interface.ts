/**
 * State interface mappings relecting those in Python.
 *
 * Hand-sketched, not complete.
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/state.py
 *
 */

export type PrimaryKey = number;

export type UnixTimestamp = number;

export type ChainId = number;

export type BlockNumber = number;

export type HexString = `0x${string}`;

export type USDollarPrice = number;

export type USDollarValue = number;

// How many tokens in the token units. E.g. 0.02 WMATIC
export type TokenUnits = number;

// Percent value 0...1
export type Percent = number;

/**
 * Used to differetiate different position types in UI logic
 */
export enum PositionKind {
	open,
	closed,
	frozen
}

export interface AssetIdentifier {
	token_symbol: string;
	internal_id: PrimaryKey;
}

export interface TradingPairIdentifier {
	base: AssetIdentifier;
	quote: AssetIdentifier;
	internal_id: PrimaryKey;
}

/**
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/trade.py
 */
export interface BlockchainTransaction {
	type: string;
	chain_id: ChainId;
	broadcasted_at: UnixTimestamp;
	block_number: BlockNumber;
	tx_hash: HexString;
	revert_reason: string | null;
}

/**
 * Estimated pricing of a trade
 */
export interface PriceStructure {
	// Estimated price we are going to get when we trade with our size.
	// This includes price impact, but not slippage.
	price: USDollarPrice;

	// Market mid-price at the time of the trade decision
	mid_price: USDollarPrice;

	// List of different liquidity provider fees we need to pay per each leg of a multihop trade we do
	lp_fee: USDollarPrice[];
}

/**
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/trade.py
 */
export interface TradeExecution {
	trade_id: PrimaryKey;
	position_id: PrimaryKey;
	trade_type: 'rebalance' | 'stop_loss' | 'take_profit';

	pair: TradingPairIdentifier;

	executed_at: UnixTimestamp;
	failed_at: UnixTimestamp;

	blockchain_transactions: BlockchainTransaction[];

	assumed_price: USDollarPrice;
	executed_price: USDollarPrice;
	executed_quantity: TokenUnits;

	price_structure: PriceStructure;

	lp_fees_paid?: USDollarValue;
	lp_fees_estimated: USDollarValue;
}

export interface TriggerUpdate {
	timestamp: UnixTimestamp;
	mid_price: USDollarPrice;
	stop_loss_before: USDollarPrice;
	stop_loss_after: USDollarPrice;
	take_profit_before: USDollarPrice;
	take_profit_after: USDollarPrice;
}

/**
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/e1d3a1df80d8aa6ce505507253af8c4ed87cb222/tradeexecutor/state/position.py#L18
 */
export interface TradingPosition {
	pair: TradingPairIdentifier;
	trades: Record<PrimaryKey, TradeExecution>;
	position_id: PrimaryKey;
	opened_at: UnixTimestamp;
	closed_at: UnixTimestamp;
	frozen_at: UnixTimestamp;
	unfrozen_at: UnixTimestamp;
	portfolio_value_at_open: USDollarValue;
	last_token_price: USDollarPrice;
	stop_loss: USDollarPrice;
	trailing_stop_loss_pct: Percent;
	trigger_updates: TriggerUpdate[];
}

/**
 * Why a trade was frozen;
 */
export interface FreezeInfo {
	chain: ChainId;
	positionId: PrimaryKey;
	tradeId: PrimaryKey;
	revertReason: string;
	txHash: HexString;
}

/**
 * Position stats
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/statistics.py#L21
 */
export interface PositionStatistics {
	calculated_at: number;
	last_valuation_at: number;
	profitability: number;
	profit_usd: number;
	quantity: number;
	value: number;
}

export interface Stats {
	portfolio: any;
	positions: Record<number, any[]>;
	closed_positions: Record<number, any>;
}

/**
 * State profitabiltiy statistics.
 */
export interface Stats {
	portfolio: any;
	positions: Record<number, PositionStatistics[]>;
	closed_positions: Record<number, any>;
}

/**
 * Portfolio state.
 *
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/portfolio.py#L24
 */
export interface Portfolio {
	open_positions: Record<number, TradingPosition>;
	frozen_positions: Record<number, TradingPosition>;
	closed_positions: Record<number, TradingPosition>;
}

/**
 * Strategy execution state as exported from Python.
 *
 * For structure details see: https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/state.py#L25
 *
 *
 */
export interface State {
	portfolio: any;
	stats: Stats;
	cycle: number;
	created_at: UnixTimestamp;
}
