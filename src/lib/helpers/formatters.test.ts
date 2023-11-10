import { formatDollar, formatNumber } from './formatters';

describe('formatDollar', () => {
	test('should round to two digits and show $ prefix by default', () => {
		expect(formatDollar(123.456)).toEqual('$123.46');
	});

	test('should use compact format magnitude abbreviations', () => {
		expect(formatDollar(1234.56)).toEqual('$1.23K');
		expect(formatDollar(12345.67)).toEqual('$12.35K');
		expect(formatDollar(1_234_567)).toEqual('$1.23M');
		expect(formatDollar(1_234_567_890)).toEqual('$1.23B');
		expect(formatDollar(1_234_567_890_123)).toEqual('$1.23T');
	});

	test('should use scientific format for very small/large numbers', () => {
		expect(formatDollar(1e-7)).toEqual('$1.00E-7');
		expect(formatDollar(1e15)).toEqual('$1.00E15');
	});

	test('should display minDigits digits when specified', () => {
		expect(formatDollar(12345.67, 3)).toEqual('$12.346K');
		expect(formatDollar(123.4567, 3)).toEqual('$123.457');
		expect(formatDollar(0.00123, 3)).toEqual('$0.00123');
		expect(formatDollar(1, 3)).toEqual('$1.000');
	});

	test('should display up to maxPrecision significant digits when specified', () => {
		expect(formatDollar(12345.67, 2, 3)).toEqual('$12.35K');
		expect(formatDollar(123.4567, 2, 3)).toEqual('$123.46');
		expect(formatDollar(0.00123, 2, 3)).toEqual('$0.00123');
		expect(formatDollar(1, 2, 3)).toEqual('$1.00');
	});

	test('should not show $ prefix when showPrefix = false', () => {
		expect(formatDollar(123.456, 2, 3, false)).toEqual('123.46');
	});
});

describe('formatNumber', () => {
	test('should round to two digits by default', () => {
		expect(formatNumber(123.456)).toEqual('123.46');
		expect(formatNumber(12.345)).toEqual('12.35');
		expect(formatNumber(1.2345)).toEqual('1.23');
		expect(formatNumber(0.12345)).toEqual('0.12');
		expect(formatNumber(0.012345)).toEqual('0.012');
		expect(formatNumber(0.0012345)).toEqual('0.0012');
	});

	test('should display minDigits digits when specified', () => {
		expect(formatNumber(12345.67, 3)).toEqual('12,345.670');
		expect(formatNumber(123.4567, 3)).toEqual('123.457');
		expect(formatNumber(0.00123, 3)).toEqual('0.00123');
		expect(formatNumber(1, 3)).toEqual('1.000');
	});

	test('should display up to maxPrecision significant digits when specified', () => {
		expect(formatNumber(12345.67, 2, 3)).toEqual('12,345.67');
		expect(formatNumber(123.4567, 2, 3)).toEqual('123.46');
		expect(formatNumber(0.00123, 2, 3)).toEqual('0.00123');
		expect(formatNumber(1, 2, 3)).toEqual('1.00');
	});

	test('should round to integer when minDigits = 0 and maxPrecision not specified', () => {
		expect(formatNumber(123.456, 0)).toEqual('123');
		expect(formatNumber(0.00123, 0)).toEqual('0');
	});

	test('should round appropriately when minDigits = 0 and maxPrecision > 0', () => {
		expect(formatNumber(123.45, 0, 2)).toEqual('123');
		expect(formatNumber(12.34, 0, 2)).toEqual('12');
		expect(formatNumber(1.23, 0, 2)).toEqual('1.2');
		expect(formatNumber(0.123, 0, 2)).toEqual('0.12');
		expect(formatNumber(0.0123, 0, 2)).toEqual('0.012');
	});

	test('should throw error when minDigits or maxPrecision out of range', () => {
		expect(() => formatNumber(123.456, -1)).toThrowError();
		expect(() => formatNumber(123.456, 2, 1)).toThrowError();
	});

	test('should coerce string argument to number', () => {
		expect(formatNumber('123.456')).toEqual('123.46');
	});

	test('should return "---" for non-numeric values', () => {
		expect(formatNumber(null)).toEqual('---');
		expect(formatNumber(undefined)).toEqual('---');
		expect(formatNumber(NaN)).toEqual('---');
		expect(formatNumber('')).toEqual('---');
		expect(formatNumber('foo')).toEqual('---');
	});
});
