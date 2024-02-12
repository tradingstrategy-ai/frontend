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

	test('should return last stats value as value', () => {
		expect(positionInfo.value).toEqual(stats[1].value);
	});

	test('should return first stats value as valueAtOpen', () => {
		expect(positionInfo.valueAtOpen).toEqual(stats[0].value);
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

	test('should return undefined for valueAtClose prior to final stats calculated', () => {
		expect(positionInfo.valueAtClose).toBeUndefined();
	});

	test('should return second-to-last stats value for valueAtClose after final stats calculated', () => {
		vi.setSystemTime('2024-01-01T03:00:00Z');
		positionInfo.stats.push(fixture.fromSchema(positionStatisticsSchema, { seed: 3 }));
		expect(positionInfo.valueAtClose).toEqual(positionInfo.stats.at(-2)?.value);
	});
});
