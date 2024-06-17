import { formatByteUnits, formatDollar, formatNumber, formatTokenAmount } from './formatters';

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

	test('should round to two digits and show $ prefix by default', () => {
		expect(formatTokenAmount(123.456)).toEqual('123.46');
	});

	test('should format 0 and -0 correctly', () => {
		expect(formatTokenAmount(0)).toEqual('0.00');
		expect(formatTokenAmount(-0)).toEqual('0.00');
	});

	test('should use compact format magnitude abbreviations', () => {
		expect(formatTokenAmount(1234.56)).toEqual('1.23K');
		expect(formatTokenAmount(12345.67)).toEqual('12.35K');
		expect(formatTokenAmount(1_234_567)).toEqual('1.23M');
		expect(formatTokenAmount(1_234_567_890)).toEqual('1.23B');
		expect(formatTokenAmount(1_234_567_890_123)).toEqual('1.23T');
	});

	test('should use scientific format for ery small/large numbelrs', () => {
		expect(formatTokenAmount(1e-7)).toEqual('1.00E-7');
		expect(formatTokenAmount(1e15)).toEqual('1.00E15');
	});

	test('should display minDigits digits when specified', () => {
		expect(formatTokenAmount(12345.67, 3)).toEqual('12.346K');
		expect(formatTokenAmount(123.4567, 3)).toEqual('123.457');
		expect(formatTokenAmount(0.00123, 3)).toEqual('0.00123');
		expect(formatTokenAmount(1, 3)).toEqual('1.000');
	});

	test('should display up to maxPrecision significant digits when specified', () => {
		expect(formatTokenAmount(12345.67, 2, 3)).toEqual('12.35K');
		expect(formatTokenAmount(123.4567, 2, 3)).toEqual('123.46');
		expect(formatTokenAmount(0.00123, 2, 3)).toEqual('0.00123');
		expect(formatTokenAmount(1, 2, 3)).toEqual('1.00');
	});
});

describe('formatDollar', () => {
	test('should include $ prefix', () => {
		expect(formatDollar(123.456)).toEqual('$123.46');
	});

	// Testing implementation details to ensure that all of the features
	// of formatTokenAmount are also supported
	test('should use formatTokenAmount under the hood', () => {
		expect(formatDollar.toString()).toContain('formatTokenAmount');
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

describe('formatByteUnits', () => {
	test('should convert to human-readable byte units', () => {
		expect(formatByteUnits(123)).toEqual('123.0 B');
		expect(formatByteUnits(2345)).toEqual('2.3 KB');
	});

	test('should support units up to petabytes', () => {
		expect(formatByteUnits(5e3)).toEqual('4.9 KB');
		expect(formatByteUnits(5e6)).toEqual('4.8 MB');
		expect(formatByteUnits(5e9)).toEqual('4.7 GB');
		expect(formatByteUnits(5e12)).toEqual('4.5 TB');
		expect(formatByteUnits(5e15)).toEqual('4.4 PB');
		expect(formatByteUnits(5e18)).toEqual('4,440.9 PB');
	});

	test('should display 0 B when value is 0', () => {
		expect(formatByteUnits(0)).toEqual('0.0 B');
	});

	test('should handle negative values', () => {
		expect(formatByteUnits(-123)).toEqual('-123.0 B');
		expect(formatByteUnits(-23456)).toEqual('-22.9 KB');
	});

	test('should return "---" for non-numeric values', () => {
		expect(formatNumber(null)).toEqual('---');
		expect(formatNumber(undefined)).toEqual('---');
		expect(formatNumber(NaN)).toEqual('---');
		expect(formatNumber('')).toEqual('---');
		expect(formatNumber('foo')).toEqual('---');
	});
});
