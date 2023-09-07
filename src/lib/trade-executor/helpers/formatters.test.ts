import { formatTokenAmount } from './formatters';

describe('formatTokenAmount', () => {
	test('should return `---` for null or undefined', () => {
		expect(formatTokenAmount(null)).toBe('---');
		expect(formatTokenAmount(undefined)).toBe('---');
	});

	test('should support number or string input', () => {
		expect(formatTokenAmount(1)).toBe('1.00');
		expect(formatTokenAmount('1')).toBe('1.00');
		expect(formatTokenAmount('1.00')).toBe('1.00');
	});
});
