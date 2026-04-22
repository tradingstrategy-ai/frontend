import { describe, test, expect } from 'vitest';
import { utcDay, utcHour } from 'd3-time';
import { ratesToCumulativeReturn } from './treasury-benchmark';
import { isPerpetualFuturesVault } from './isPerpetualFuturesVault';
import { isValidDateString } from '$lib/fred-helpers';

// --- ratesToCumulativeReturn ---

describe('ratesToCumulativeReturn', () => {
	const day = utcDay;
	const hour4 = utcHour.every(4)!;

	function makeRates(startDate: Date, count: number, rate: number): [number, number][] {
		const rates: [number, number][] = [];
		for (let i = 0; i < count; i++) {
			const d = new Date(startDate.getTime() + i * 86_400_000);
			// Skip weekends (like FRED)
			if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;
			rates.push([d.getTime() / 1000, rate]);
		}
		return rates;
	}

	test('constant 5% rate over 365 days yields ~5% total return', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-12-31T00:00:00Z');
		const rates = makeRates(start, 365, 5.0);
		const result = ratesToCumulativeReturn(rates, 1.0, day, start, end);

		expect(result.length).toBeGreaterThan(0);
		const lastValue = result.at(-1)!.value;
		// Should be ~1.05 (5% annual return)
		expect(lastValue).toBeCloseTo(1.05, 1);

		const lastPctChange = result.at(-1)!.customValues.percentChange;
		expect(lastPctChange).toBeCloseTo(0.05, 1);
	});

	test('first output point has value === startingValue', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-31T00:00:00Z');
		const rates = makeRates(start, 31, 4.0);
		const result = ratesToCumulativeReturn(rates, 1.23, day, start, end);

		expect(result[0].value).toBe(1.23);
		expect(result[0].customValues.percentChange).toBe(0);
	});

	test('first output time >= startDate', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-31T00:00:00Z');
		const rates = makeRates(start, 31, 4.0);
		const result = ratesToCumulativeReturn(rates, 1.0, day, start, end);

		const startTs = start.getTime() / 1000;
		expect(result[0].time).toBeGreaterThanOrEqual(startTs);
	});

	test('4h interval produces ~6x more points than 1d for same range', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-31T00:00:00Z');
		const rates = makeRates(start, 31, 4.0);

		const daily = ratesToCumulativeReturn(rates, 1.0, day, start, end);
		const fourHourly = ratesToCumulativeReturn(rates, 1.0, hour4, start, end);

		// 4h should have roughly 6x the points of daily
		expect(fourHourly.length).toBeGreaterThan(daily.length * 4);
		expect(fourHourly.length).toBeLessThanOrEqual(daily.length * 7);
	});

	test('4h and 1d intervals yield the same final return', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-31T00:00:00Z');
		const rates = makeRates(start, 31, 4.0);

		const daily = ratesToCumulativeReturn(rates, 1.0, day, start, end);
		const fourHourly = ratesToCumulativeReturn(rates, 1.0, hour4, start, end);

		expect(fourHourly.at(-1)!.value).toBeCloseTo(daily.at(-1)!.value, 6);
	});

	test('customValues.annualRate is preserved on every point', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-10T00:00:00Z');
		const rates = makeRates(start, 10, 3.5);
		const result = ratesToCumulativeReturn(rates, 1.0, day, start, end);

		for (const point of result) {
			expect(point.customValues.annualRate).toBe(3.5);
			expect(typeof point.customValues.rateDate).toBe('number');
			expect(typeof point.customValues.percentChange).toBe('number');
		}
	});

	test('customValues.rateDate tracks the source rate observation date', () => {
		const start = new Date('2025-01-03T00:00:00Z'); // Friday
		const end = new Date('2025-01-06T00:00:00Z'); // Monday
		const rates: [number, number][] = [
			[start.getTime() / 1000, 4.0],
			[end.getTime() / 1000, 4.1]
		];
		const result = ratesToCumulativeReturn(rates, 1.0, day, start, end);

		expect(result.map((point) => point.customValues.rateDate)).toEqual([
			new Date('2025-01-03T00:00:00Z').getTime() / 1000,
			new Date('2025-01-03T00:00:00Z').getTime() / 1000,
			new Date('2025-01-03T00:00:00Z').getTime() / 1000,
			new Date('2025-01-06T00:00:00Z').getTime() / 1000
		]);
		expect(result.at(-1)?.customValues.annualRate).toBe(4.1);
	});

	test('seed days before startDate are excluded from output', () => {
		// Simulate seed: rates start 7 days before the visible range
		const seedStart = new Date('2024-12-25T00:00:00Z');
		const visibleStart = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-10T00:00:00Z');
		const rates = makeRates(seedStart, 20, 4.0);

		const result = ratesToCumulativeReturn(rates, 1.0, day, visibleStart, end);

		const seedTs = seedStart.getTime() / 1000;
		const visibleTs = visibleStart.getTime() / 1000;
		for (const point of result) {
			expect(point.time).toBeGreaterThanOrEqual(visibleTs);
			expect(point.time).not.toBeLessThan(seedTs);
		}

		// First point should be at visibleStart, not seedStart
		expect(result[0].value).toBe(1.0);
	});

	test('returns empty array for empty rates', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-31T00:00:00Z');
		expect(ratesToCumulativeReturn([], 1.0, day, start, end)).toEqual([]);
	});

	test('returns empty array for zero starting value', () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-01-31T00:00:00Z');
		const rates = makeRates(start, 31, 4.0);
		expect(ratesToCumulativeReturn(rates, 0, day, start, end)).toEqual([]);
	});
});

// --- isPerpetualFuturesVault ---

describe('isPerpetualFuturesVault', () => {
	test('detects perp via flag', () => {
		expect(isPerpetualFuturesVault({ flags: ['perp_dex_trading_vault'], chain_id: 1 })).toBe(true);
	});

	test('detects HyperCore (9999) as perp', () => {
		expect(isPerpetualFuturesVault({ flags: [], chain_id: 9999 })).toBe(true);
	});

	test('detects GRVT (325) as perp', () => {
		expect(isPerpetualFuturesVault({ flags: [], chain_id: 325 })).toBe(true);
	});

	test('detects Lighter (9998) as perp', () => {
		expect(isPerpetualFuturesVault({ flags: [], chain_id: 9998 })).toBe(true);
	});

	test('HyperEVM (999) is NOT perp', () => {
		expect(isPerpetualFuturesVault({ flags: [], chain_id: 999 })).toBe(false);
	});

	test('regular Ethereum vault is NOT perp', () => {
		expect(isPerpetualFuturesVault({ flags: [], chain_id: 1 })).toBe(false);
	});

	test('flag takes priority over non-perp chain_id', () => {
		expect(isPerpetualFuturesVault({ flags: ['perp_dex_trading_vault', 'beta'], chain_id: 1 })).toBe(true);
	});
});

// --- isValidDateString ---

describe('isValidDateString', () => {
	test('accepts valid dates', () => {
		expect(isValidDateString('2025-01-01')).toBe(true);
		expect(isValidDateString('2024-02-29')).toBe(true); // leap year
		expect(isValidDateString('1954-01-04')).toBe(true);
	});

	test('rejects impossible dates', () => {
		expect(isValidDateString('2025-02-29')).toBe(false); // not a leap year
		expect(isValidDateString('2026-02-31')).toBe(false);
		expect(isValidDateString('2025-13-01')).toBe(false);
		expect(isValidDateString('2025-00-01')).toBe(false);
	});

	test('rejects non-YYYY-MM-DD formats', () => {
		expect(isValidDateString('01-01-2025')).toBe(false);
		expect(isValidDateString('2025/01/01')).toBe(false);
		expect(isValidDateString('not-a-date')).toBe(false);
		expect(isValidDateString('')).toBe(false);
	});
});
