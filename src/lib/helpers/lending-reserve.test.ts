import { SECONDS_PER_DAY, aprToApy, compoundInterest, yieldForPeriod } from './lending-reserve';

describe('lending-reserve module', () => {
	describe('yieldForPeriod', () => {
		test('should return undefined for nullish APR or period', () => {
			expect(yieldForPeriod(null, 100)).toBeUndefined();
			expect(yieldForPeriod(0.1, null)).toBeUndefined();
		});

		test('should throw error for negative period', () => {
			expect(() => yieldForPeriod(-0.2, -1)).toThrowError();
		});

		test('should return 0 for 0 APR or seconds', () => {
			expect(yieldForPeriod(0, 1_000_000)).toBe(0);
			expect(yieldForPeriod(0.1, 0)).toBe(0);
		});

		test('should return correct yield for positive APR', () => {
			expect(yieldForPeriod(0.1, SECONDS_PER_DAY)).toBeCloseTo(0.00027401, 8);
		});

		test('should return correct yield for negative APR', () => {
			expect(yieldForPeriod(-0.2, SECONDS_PER_DAY)).toBeCloseTo(-0.0005478, 7);
		});
	});

	describe('aprToApy', () => {
		test('should return undefined for nullish APR', () => {
			expect(aprToApy(null)).toBeUndefined();
			expect(aprToApy(undefined)).toBeUndefined();
			expect(aprToApy(NaN)).toBeUndefined();
		});

		test('should return 0 for 0 APR', () => {
			expect(aprToApy(0)).toBe(0);
		});

		test('should return correct APY for positive APR', () => {
			expect(aprToApy(0.1)).toBeCloseTo(0.10517, 5);
		});

		test('should return correct APY for negative APR', () => {
			expect(aprToApy(-0.2)).toBeCloseTo(-0.18127, 5);
		});
	});

	describe('compoundInterest', () => {
		test('should return undefined for nullish principal, APR or period', () => {
			expect(compoundInterest(null, 0.1, 1)).toBeUndefined();
			expect(compoundInterest(1000, null, 1)).toBeUndefined();
			expect(compoundInterest(1000, 0.1, null)).toBeUndefined();
		});

		test('should throw error for negative principal or period', () => {
			expect(() => compoundInterest(-1000, 0.1, 1)).toThrowError();
			expect(() => compoundInterest(1000, 0.1, -1)).toThrowError();
		});

		test('should return 0 for 0 principal, APR or seconds', () => {
			expect(compoundInterest(0, 0.1, SECONDS_PER_DAY)).toBe(0);
			expect(compoundInterest(1000, 0, SECONDS_PER_DAY)).toBe(0);
			expect(compoundInterest(1000, 0.1, 0)).toBe(0);
		});

		test('should return correct interest for positive APR', () => {
			expect(compoundInterest(1000, 0.1, SECONDS_PER_DAY)).toBeCloseTo(0.27401, 5);
		});

		test('should return correct interest for negative APR', () => {
			expect(compoundInterest(1000, -0.2, SECONDS_PER_DAY)).toBeCloseTo(-0.5478, 5);
		});
	});
});
