import { z } from 'zod';
import { tradeExecutionSchema } from '../schemas/trade';
import { positionStatisticsSchema } from '../schemas/statistics';
import { tradingPositionSchema } from '../schemas/position';
import { createTradingPositionInfo } from './position-info';

type TradeExecutionInput = z.input<typeof tradeExecutionSchema>;
type PositionStatisticsInput = z.input<typeof positionStatisticsSchema>;
type PositionInput = z.input<typeof tradingPositionSchema>;

const POSITION_OPEN_TS = 1735689600;
const HOUR = 60 * 60;

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

const pair = {
	base: WETH,
	quote: USDC,
	pool_address: '0x234',
	kind: 'spot_market_hold'
} as const;

const rawTrade: TradeExecutionInput = {
	trade_id: 1,
	position_id: 1,
	trade_type: 'rebalance',
	pair,
	opened_at: POSITION_OPEN_TS,
	planned_quantity: 100,
	planned_reserve: 100,
	planned_price: 1,
	reserve_currency: USDC,
	blockchain_transactions: []
};

const rawPosition: PositionInput = {
	position_id: 1,
	pair,
	opened_at: POSITION_OPEN_TS,
	last_pricing_at: POSITION_OPEN_TS + 2 * HOUR,
	last_token_price: 1.1,
	last_reserve_price: 1,
	reserve_currency: USDC,
	trades: { 1: rawTrade },
	balance_updates: {},
	trigger_updates: [],
	valuation_updates: []
};

const stats = [
	{
		calculated_at: POSITION_OPEN_TS + HOUR,
		last_valuation_at: POSITION_OPEN_TS + HOUR,
		profitability: 0.0,
		profit_usd: 0,
		quantity: 100,
		value: 100
	},
	{
		calculated_at: POSITION_OPEN_TS + 2 * HOUR,
		last_valuation_at: POSITION_OPEN_TS + 2 * HOUR,
		profitability: 0.01,
		profit_usd: 10,
		quantity: 100,
		value: 110
	}
].map((s) => positionStatisticsSchema.parse(s));

function positionStat(stat: Partial<PositionStatisticsInput> = {}) {
	return positionStatisticsSchema.parse({
		calculated_at: POSITION_OPEN_TS + HOUR,
		last_valuation_at: POSITION_OPEN_TS + HOUR,
		profitability: 0,
		profit_usd: 0,
		quantity: 100,
		value: 100,
		...stat
	});
}

describe('TradingPositionInfo object with no stats', () => {
	const position = tradingPositionSchema.parse(rawPosition);
	const positionInfo = createTradingPositionInfo(position);

	test('should include all properties from supplied TradingPosition', () => {
		tradingPositionSchema.keyof().options.forEach((key) => {
			expect(positionInfo[key]).toEqual(position[key]);
		});
	});

	test('should have empty stats array', () => {
		expect(positionInfo.stats).toEqual([]);
	});
});

describe('open position with stats entries', () => {
	const position = tradingPositionSchema.parse(rawPosition);
	const positionInfo = createTradingPositionInfo(position, stats);

	test('should not be closed', () => {
		expect(positionInfo.closed).toBe(false);
	});

	test('should include supplied stats array', () => {
		expect(positionInfo.stats).toEqual(stats);
	});

	test('should return last stats value as currentValue', () => {
		expect(positionInfo.currentValue).toEqual(stats[1].value);
	});

	test('should return first trade executedValue as valueAtOpen', () => {
		const spy = vi.spyOn(positionInfo.trades[0], 'executedValue', 'get');
		spy.mockImplementationOnce(() => 123.45);
		expect(positionInfo.valueAtOpen).toEqual(123.45);
		expect(spy).toHaveBeenCalledOnce();
	});

	test('should return undefined for valutAtClose', () => {
		expect(positionInfo.valueAtClose).toBeUndefined();
	});
});

describe('closed position with stats entries', () => {
	const position = tradingPositionSchema.parse({
		...rawPosition,
		closed_at: POSITION_OPEN_TS + 2 * HOUR
	});
	const positionInfo = createTradingPositionInfo(position, stats);

	test('should be closed', () => {
		expect(positionInfo.closed).toBe(true);
	});

	test('should return last trade executedValue for valueAtClose', () => {
		const spy = vi.spyOn(positionInfo.trades.at(-1)!, 'executedValue', 'get');
		spy.mockImplementationOnce(() => 234.56);
		expect(positionInfo.valueAtClose).toEqual(234.56);
		expect(spy).toHaveBeenCalledOnce();
	});
});

describe('dust position warning', () => {
	test('detects an explicit dust note', () => {
		const position = tradingPositionSchema.parse({
			...rawPosition,
			notes: 'Auto-closed as dust by correct-accounts (equity=$0.0106)'
		});

		expect(createTradingPositionInfo(position).isDustPositionWarning).toBe(true);
	});

	test('detects a tiny residual quantity in final stats', () => {
		const position = tradingPositionSchema.parse({
			...rawPosition,
			closed_at: POSITION_OPEN_TS + 3 * HOUR,
			last_token_price: 0.95
		});
		const residualStats = [
			positionStat({
				calculated_at: POSITION_OPEN_TS + 2 * HOUR,
				last_valuation_at: POSITION_OPEN_TS + 2 * HOUR,
				quantity: 1334,
				value: 1272
			}),
			positionStat({
				calculated_at: POSITION_OPEN_TS + 4 * HOUR,
				last_valuation_at: POSITION_OPEN_TS + 4 * HOUR,
				quantity: 1.0023875,
				value: 0
			})
		];

		expect(createTradingPositionInfo(position, residualStats).isDustPositionWarning).toBe(true);
	});

	test('does not flag a normal fully closed zero-quantity position', () => {
		const position = tradingPositionSchema.parse({
			...rawPosition,
			closed_at: POSITION_OPEN_TS + 3 * HOUR
		});
		const closedStats = [
			positionStat({
				calculated_at: POSITION_OPEN_TS + 2 * HOUR,
				last_valuation_at: POSITION_OPEN_TS + 2 * HOUR,
				quantity: 100,
				value: 100
			}),
			positionStat({
				calculated_at: POSITION_OPEN_TS + 4 * HOUR,
				last_valuation_at: POSITION_OPEN_TS + 4 * HOUR,
				quantity: 0,
				value: 0
			})
		];

		expect(createTradingPositionInfo(position, closedStats).isDustPositionWarning).toBe(false);
	});
});

describe('position with frozen_at value', () => {
	const frozenPosition = tradingPositionSchema.parse({
		...rawPosition,
		frozen_at: new Date().valueOf() / 1000,
		unfrozen_at: null
	});
	const frozenPositionInfo = createTradingPositionInfo(frozenPosition);

	test('should be frozen', () => {
		expect(frozenPositionInfo.frozen).toBeTruthy();
	});

	test('should not be stillOpen', () => {
		expect(frozenPositionInfo.stillOpen).toBeFalsy();
	});

	describe('and unfrozen_at value', () => {
		const unfrozenPositionInfo = createTradingPositionInfo({ ...frozenPosition, unfrozen_at: new Date() });

		test('should no longer be frozen', () => {
			expect(unfrozenPositionInfo.frozen).toBeFalsy();
		});

		test('should be stillOpen', () => {
			expect(unfrozenPositionInfo.stillOpen).toBeTruthy();
		});
	});
});
