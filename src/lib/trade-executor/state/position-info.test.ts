import { fixture } from './utility-type-fixtures';
import { tradingPositionSchema } from './position';
import { type PositionStatistics, positionStatisticsSchema } from './statistics';
import { type TradingPositionInfo, createTradingPositionInfo } from './position-info';

const position = fixture.fromSchema(tradingPositionSchema, { seed: 1 });

describe('TradingPositionInfo object with no stats', () => {
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
	const stats = [
		fixture.fromSchema(positionStatisticsSchema, { seed: 1 }),
		fixture.fromSchema(positionStatisticsSchema, { seed: 2 })
	];

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
	let positionInfo: TradingPositionInfo;

	beforeEach(() => {
		vi.useFakeTimers();

		const stats: PositionStatistics[] = [];
		vi.setSystemTime('2024-01-01T00:00:00Z');
		stats.push(fixture.fromSchema(positionStatisticsSchema, { seed: 1 }));
		vi.setSystemTime('2024-01-01T01:00:00Z');
		stats.push(fixture.fromSchema(positionStatisticsSchema, { seed: 2 }));
		vi.setSystemTime('2024-01-01T02:00:00Z');
		const position = fixture.fromSchema(tradingPositionSchema, { seed: 1 });
		position.closed_at = new Date();
		positionInfo = createTradingPositionInfo(position, stats);

		return () => vi.useRealTimers();
	});

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

describe('position with frozen_at value', () => {
	const frozenPosition = { ...position, frozen_at: new Date() };
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
