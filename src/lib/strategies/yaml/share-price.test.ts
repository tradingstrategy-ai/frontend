import { describe, expect, it } from 'vitest';
import { downsampleSharePriceReturns } from './share-price';

describe('downsampleSharePriceReturns', () => {
	it('keeps the final sample in each UTC day', () => {
		const returns: [number, number][] = [
			[Date.UTC(2026, 0, 1, 10) / 1000, 0],
			[Date.UTC(2026, 0, 1, 16) / 1000, 0.1],
			[Date.UTC(2026, 0, 2, 8) / 1000, 0.2],
			[Date.UTC(2026, 0, 2, 20) / 1000, 0.3]
		];

		expect(downsampleSharePriceReturns(returns)).toEqual([
			[Date.UTC(2025, 11, 31) / 1000, 0],
			[Date.UTC(2026, 0, 1) / 1000, 0.1],
			[Date.UTC(2026, 0, 2) / 1000, 0.3]
		]);
	});
});
