import { describe, expect, it } from 'vitest';
import { downsampleDailySeries } from './helpers';

describe('downsampleDailySeries', () => {
	it('keeps the final sample in each UTC day and a carry-in point', () => {
		const values: [number, number][] = [
			[Date.UTC(2026, 0, 1, 10) / 1000, 0],
			[Date.UTC(2026, 0, 1, 16) / 1000, 0.1],
			[Date.UTC(2026, 0, 2, 8) / 1000, 0.2],
			[Date.UTC(2026, 0, 2, 20) / 1000, 0.3]
		];

		expect(downsampleDailySeries(values)).toEqual([
			[Date.UTC(2025, 11, 31) / 1000, 0],
			[Date.UTC(2026, 0, 1) / 1000, 0.1],
			[Date.UTC(2026, 0, 2) / 1000, 0.3]
		]);
	});
});
