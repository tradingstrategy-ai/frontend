import { describe, it, expect } from 'vitest';
import { computeDrawdownSeries } from './drawdown';

describe('computeDrawdownSeries', () => {
	it('returns empty array for empty input', () => {
		expect(computeDrawdownSeries([])).toEqual([]);
	});

	it('returns zero drawdown for a single data point', () => {
		expect(computeDrawdownSeries([[1000, 100]])).toEqual([[1000, 0]]);
	});

	it('returns zero drawdown when prices only go up', () => {
		const input: [number, number][] = [
			[1, 100],
			[2, 110],
			[3, 120]
		];
		const result = computeDrawdownSeries(input);
		expect(result).toEqual([
			[1, 0],
			[2, 0],
			[3, 0]
		]);
	});

	it('returns zero drawdown for flat prices', () => {
		const input: [number, number][] = [
			[1, 50],
			[2, 50],
			[3, 50]
		];
		const result = computeDrawdownSeries(input);
		expect(result).toEqual([
			[1, 0],
			[2, 0],
			[3, 0]
		]);
	});

	it('computes correct drawdown after a peak', () => {
		const input: [number, number][] = [
			[1, 100],
			[2, 80],
			[3, 90]
		];
		const result = computeDrawdownSeries(input);
		expect(result[0]).toEqual([1, 0]);
		expect(result[1][0]).toBe(2);
		expect(result[1][1]).toBeCloseTo(-0.2); // (80-100)/100
		expect(result[2][0]).toBe(3);
		expect(result[2][1]).toBeCloseTo(-0.1); // (90-100)/100
	});

	it('tracks running peak across multiple highs', () => {
		const input: [number, number][] = [
			[1, 100],
			[2, 120],
			[3, 90],
			[4, 130],
			[5, 110]
		];
		const result = computeDrawdownSeries(input);
		expect(result[0]).toEqual([1, 0]);
		expect(result[1]).toEqual([2, 0]); // new high
		expect(result[2][1]).toBeCloseTo(-0.25); // (90-120)/120
		expect(result[3]).toEqual([4, 0]); // new high
		expect(result[4][1]).toBeCloseTo(-2 / 13); // (110-130)/130
	});

	it('handles zero starting price without division error', () => {
		const input: [number, number][] = [
			[1, 0],
			[2, 0],
			[3, 100],
			[4, 80]
		];
		const result = computeDrawdownSeries(input);
		expect(result[0]).toEqual([1, 0]);
		expect(result[1]).toEqual([2, 0]);
		expect(result[2]).toEqual([3, 0]); // first positive price = new peak
		expect(result[3][1]).toBeCloseTo(-0.2); // (80-100)/100
	});

	it('preserves timestamps', () => {
		const input: [number, number][] = [
			[1700000000, 1.05],
			[1700086400, 1.0],
			[1700172800, 1.02]
		];
		const result = computeDrawdownSeries(input);
		expect(result.map(([ts]) => ts)).toEqual([1700000000, 1700086400, 1700172800]);
	});
});
