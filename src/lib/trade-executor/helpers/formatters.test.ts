import { formatProfitability, formatTokenAmount } from './formatters';

describe('formatProfitability', () => {
	test('should return `---` for null or undefined', () => {
		expect(formatProfitability(null)).toBe('---');
		expect(formatProfitability(undefined)).toBe('---');
	});

	test('should support numeric or string input', () => {
		expect(formatProfitability(0.01)).toBe('▲ 1.0%');
		expect(formatProfitability('0.01')).toBe('▲ 1.0%');
	});

	test('should have neutral direction indicator for value of zero', () => {
		expect(formatProfitability(0.0)).toBe('◼︎ 0.0%');
		expect(formatProfitability(-0.0)).toBe('◼︎ 0.0%');
	});

	test('should have up direction indicator for positive values', () => {
		expect(formatProfitability(0.001)).toBe('▲ 0.1%');
		expect(formatProfitability(0.01)).toBe('▲ 1.0%');
	});

	test('should have down direction indicator for negative values', () => {
		expect(formatProfitability(-0.001)).toBe('▼ 0.1%');
		expect(formatProfitability(-0.01)).toBe('▼ 1.0%');
	});

	test('should display 1 decimal of precision by default', () => {
		expect(formatProfitability(5)).toBe('▲ 500.0%');
		expect(formatProfitability(0.5)).toBe('▲ 50.0%');
		expect(formatProfitability(0.05)).toBe('▲ 5.0%');
		expect(formatProfitability(0.005)).toBe('▲ 0.5%');
		expect(formatProfitability(0.0005)).toBe('▲ 0.05%');
	});
});

describe('formatTokenAmount', () => {
	test('should return `---` for null or undefined', () => {
		expect(formatTokenAmount(null)).toBe('---');
		expect(formatTokenAmount(undefined)).toBe('---');
	});

	test('should support numeric or string input', () => {
		expect(formatTokenAmount(1)).toBe('1.00');
		expect(formatTokenAmount('1')).toBe('1.00');
		expect(formatTokenAmount('1.00')).toBe('1.00');
	});
});
