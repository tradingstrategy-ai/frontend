import { fixture } from './utility-type-fixtures';
import { type TradeExecution, tradeExecutionSchema } from './trade';
import { type TradeInfo, TradeDirections, createTradeInfo } from './trade-info';

const tradeExecution = fixture.fromSchema(tradeExecutionSchema, { seed: 1 });

describe('a spot long position trade', () => {
	let tradeInfo: TradeInfo;

	beforeEach(() => {
		tradeInfo = createTradeInfo(tradeExecution);
		tradeInfo.pair.kind = 'spot_market_hold';
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
		tradeInfo = createTradeInfo(tradeExecution);
		tradeInfo.pair.kind = 'lending_protocol_short';
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
		tradeInfo = createTradeInfo(tradeExecution);
		tradeInfo.pair.kind = 'credit_supply';
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
