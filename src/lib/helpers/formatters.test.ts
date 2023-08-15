import { formatDollar } from './formatters';

describe('general-purpose formatters', () => {
	describe('formatDollar', () => {
		test('should round to two digits and show $ prefix by default', () => {
			expect(formatDollar(123.456)).toEqual('$123.46');
			expect(formatDollar(12.345)).toEqual('$12.35');
			expect(formatDollar(1.2345)).toEqual('$1.23');
			expect(formatDollar(0.12345)).toEqual('$0.12');
			expect(formatDollar(0.012345)).toEqual('$0.012');
			expect(formatDollar(0.0012345)).toEqual('$0.0012');
		});

		test('should use compact format magnitude abbreviations', () => {
			expect(formatDollar(1234.56)).toEqual('$1.23K');
			expect(formatDollar(12345.67)).toEqual('$12.35K');
			expect(formatDollar(1_234_567)).toEqual('$1.23M');
			expect(formatDollar(1_234_567_890)).toEqual('$1.23B');
			expect(formatDollar(1_234_567_890_123)).toEqual('$1.23T');
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

		test('should throw error for minDigits < 1', () => {
			expect(() => formatDollar(123.456, 0)).toThrowError();
			expect(() => formatDollar(123.456, -1)).toThrowError();
		});

		test('should throw error for maxPrecision < minDigits', () => {
			expect(() => formatDollar(123.456, 2, 0)).toThrowError();
		});
	});
});
