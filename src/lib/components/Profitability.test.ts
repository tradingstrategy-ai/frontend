import { getProfitInfo } from './Profitability.svelte';

describe('getProfitInfo', () => {
	test('should handle numeric or string input', () => {
		expect(getProfitInfo(0.01).value).toBe(0.01);
		expect(getProfitInfo('0.01').value).toBe(0.01);
	});

	test('should return empty, neutral info for null or undefined', () => {
		const expected = expect.objectContaining({
			value: undefined,
			formatted: undefined,
			direction: 0,
			marker: '◼︎',
			directionClass: 'neutral'
		});

		expect(getProfitInfo(null)).toEqual(expected);
		expect(getProfitInfo(undefined)).toEqual(expected);
	});

	test('should return 0, neutral info for value of zero', () => {
		const expected = expect.objectContaining({
			formatted: '0.0%',
			direction: 0,
			marker: '◼︎',
			directionClass: 'neutral'
		});

		expect(getProfitInfo(0.0)).toEqual(expected);
		expect(getProfitInfo(-0.0)).toEqual(expected);
	});

	test('should return neutral info for values that round to zero', () => {
		const expected = expect.objectContaining({
			formatted: '0.0%',
			direction: 0,
			marker: '◼︎',
			directionClass: 'neutral'
		});

		expect(getProfitInfo(0.00001)).toEqual(expected);
		expect(getProfitInfo(-0.00001)).toEqual(expected);
	});

	test('should return positive (profit) info for positive values', () => {
		const expected = expect.objectContaining({
			direction: 1,
			marker: '▲',
			directionClass: 'bullish'
		});

		expect(getProfitInfo(0.001)).toEqual(expected);
		expect(getProfitInfo(0.01)).toEqual(expected);
	});

	test('should return negative (loss) info for negative values', () => {
		const expected = expect.objectContaining({
			direction: -1,
			marker: '▼',
			directionClass: 'bearish'
		});

		expect(getProfitInfo(-0.001)).toEqual(expected);
		expect(getProfitInfo(-0.01)).toEqual(expected);
	});

	describe('formatted value', () => {
		test('should have with 1 decimal of precision by default', () => {
			expect(getProfitInfo(5).formatted).toBe('500.0%');
			expect(getProfitInfo(0.5).formatted).toBe('50.0%');
			expect(getProfitInfo(0.05).formatted).toBe('5.0%');
			expect(getProfitInfo(0.005).formatted).toBe('0.5%');
		});

		test('should have 2 decimals of precision when needed', () => {
			expect(getProfitInfo(0.0005).formatted).toBe('0.05%');
		});

		test('should be unsigned for negative values', () => {
			expect(getProfitInfo(-0.005).formatted).toBe('0.5%');
			expect(getProfitInfo(-0.0005).formatted).toBe('0.05%');
		});
	});

	describe('toSting() method', () => {
		test('should return fallback for undefined/null values', () => {
			expect(getProfitInfo(undefined).toString()).toBe('---');
			expect(getProfitInfo(null).toString()).toBe('---');
		});

		test('should return marker with formatted value for valid values', () => {
			expect(getProfitInfo(0).toString()).toBe('◼︎ 0.0%');
			expect(getProfitInfo(0.001).toString()).toBe('▲ 0.1%');
			expect(getProfitInfo(-0.001).toString()).toBe('▼ 0.1%');
		});
	});

	describe('getLabel() method', () => {
		const labels = ['loss', 'no change', 'profit'];

		test('should return first arg for negative values', () => {
			expect(getProfitInfo(-0.01).getLabel(...labels)).toBe('loss');
		});

		test('should return second arg for negative values', () => {
			expect(getProfitInfo(0).getLabel(...labels)).toBe('no change');
		});

		test('should return first arg for negative values', () => {
			expect(getProfitInfo(0.01).getLabel(...labels)).toBe('profit');
		});
	});
});
