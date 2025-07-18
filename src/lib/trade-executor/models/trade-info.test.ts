import type { TradingPairIdentifier } from 'trade-executor/schemas/identifier';
import { tradeExecutionSchema } from '../schemas/trade';
import { type TradeInfo, TradeDirections, createTradeInfo } from './trade-info';

type TradeExecutionInput = z.input<typeof tradeExecutionSchema>;

const WETH = {
	chain_id: 1,
	address: '0x001',
	token_symbol: 'WETH',
	decimals: 18
} as const;

const USDC = {
	chain_id: 1,
	address: '0x002',
	token_symbol: 'USDC',
	decimals: 6
} as const;

const aPolUSDC = {
	chain_id: 1,
	address: '0x003',
	token_symbol: 'aPolUSDC',
	decimals: 6,
	underlying: USDC
} as const;

const partialRawTrade: Partial<TradeExecutionInput> = {
	trade_id: 1,
	position_id: 1,
	trade_type: 'rebalance',
	opened_at: 1735689600,
	planned_quantity: 1,
	planned_reserve: 2,
	planned_price: 0.123,
	reserve_currency: USDC,
	blockchain_transactions: []
};

describe('a spot long position trade', () => {
	let tradeInfo: TradeInfo;

	beforeEach(() => {
		const spotPair: TradingPairIdentifier = {
			base: WETH,
			quote: USDC,
			pool_address: '0x234',
			kind: 'spot_market_hold'
		};

		const tradeExecution = tradeExecutionSchema.parse({ ...partialRawTrade, pair: spotPair });
		tradeInfo = createTradeInfo(tradeExecution);
	});

	describe('with positive planned quantity', () => {
		beforeEach(() => {
			tradeInfo.planned_quantity = 1;
		});

		test('should have direction "Enter"', () => {
			expect(tradeInfo.direction).toBe(TradeDirections.Enter);
		});

		test('should have directionLabel "Buy"', () => {
			expect(tradeInfo.directionLabel).toBe('Buy');
		});
	});

	describe('with negative planned quantity', () => {
		beforeEach(() => {
			tradeInfo.planned_quantity = -1;
		});

		test('should have direction "Exit"', () => {
			expect(tradeInfo.direction).toBe(TradeDirections.Exit);
		});

		test('should have directionLabel "Sell"', () => {
			expect(tradeInfo.directionLabel).toBe('Sell');
		});
	});
});

describe('a lending protocol short position trade', () => {
	let tradeInfo: TradeInfo;

	beforeEach(() => {
		const lendingPair: TradingPairIdentifier = {
			base: aPolUSDC,
			quote: USDC,
			pool_address: '0x234',
			kind: 'lending_protocol_short'
		};

		const tradeExecution = tradeExecutionSchema.parse({ ...partialRawTrade, pair: lendingPair });
		tradeInfo = createTradeInfo(tradeExecution);
	});

	describe('with positive planned quantity', () => {
		beforeEach(() => {
			tradeInfo.planned_quantity = 1;
		});

		test('should have direction "Exit"', () => {
			expect(tradeInfo.direction).toBe(TradeDirections.Exit);
		});

		test('should have directionLabel "Buy"', () => {
			expect(tradeInfo.directionLabel).toBe('Buy');
		});
	});

	describe('with negative planned quantity', () => {
		beforeEach(() => {
			tradeInfo.planned_quantity = -1;
		});

		test('should have direction "Enter"', () => {
			expect(tradeInfo.direction).toBe(TradeDirections.Enter);
		});

		test('should have directionLabel "Sell"', () => {
			expect(tradeInfo.directionLabel).toBe('Sell');
		});
	});
});

describe('a credit position trade', () => {
	let tradeInfo: TradeInfo;

	beforeEach(() => {
		const creditPair: TradingPairIdentifier = {
			base: aPolUSDC,
			quote: USDC,
			pool_address: '0x234',
			kind: 'credit_supply'
		};

		const tradeExecution = tradeExecutionSchema.parse({ ...partialRawTrade, pair: creditPair });
		tradeInfo = createTradeInfo(tradeExecution);
	});

	describe('with positive planned quantity', () => {
		beforeEach(() => {
			tradeInfo.planned_quantity = 1;
		});

		test('should have direction "Enter"', () => {
			expect(tradeInfo.direction).toBe(TradeDirections.Enter);
		});

		test('should have directionLabel "Supply"', () => {
			expect(tradeInfo.directionLabel).toBe('Supply');
		});
	});

	describe('with negative planned quantity', () => {
		beforeEach(() => {
			tradeInfo.planned_quantity = -1;
		});

		test('should have direction "Exit"', () => {
			expect(tradeInfo.direction).toBe(TradeDirections.Exit);
		});

		test('should have directionLabel "Withdraw"', () => {
			expect(tradeInfo.directionLabel).toBe('Withdraw');
		});
	});
});
