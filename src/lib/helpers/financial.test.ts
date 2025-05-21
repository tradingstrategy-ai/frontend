import { annualizedReturn } from './financial';

describe('annualizedReturn', () => {
	test('should correctly annualize a 10% return over exactly one year', () => {
		const result = annualizedReturn('2023-01-01', '2024-01-01', 0.1);
		// For a period of exactly one year, the annualized return should equal the original return
		expect(result).toBeCloseTo(0.1, 4);
	});

	test('should correctly annualize a 5% return over a quarter (3 months)', () => {
		const result = annualizedReturn('2023-01-01', '2023-04-01', 0.05);
		// (1 + 0.05) ^ (365/90) - 1 ≈ 0.2188
		expect(result).toBeCloseTo(0.2188, 4);
	});

	test('should handle very short time periods (e.g., 1 day)', () => {
		const result = annualizedReturn('2023-01-01', '2023-01-02', 0.001);
		// (1.001) ^ 365 - 1 = 0.440
		expect(result).toBeCloseTo(0.44, 2);
	});

	test('should handle very long time periods (e.g., 5 years)', () => {
		const result = annualizedReturn('2018-01-01', '2023-01-01', 0.8);
		// (1.8) ^ (1/5) - 1 ≈ 0.125
		expect(result).toBeCloseTo(0.125, 3);
	});

	test('should return undefined if dates cannot be parsed', () => {
		const result = annualizedReturn('invalid-date', '2023-01-01', 0.05);
		expect(result).toBeUndefined();
	});

	test('should throw an error if end date is before or equal to start date', () => {
		expect(() => {
			annualizedReturn('2023-01-01', '2022-01-01', 0.05);
		}).toThrow(/endDate/);

		expect(() => {
			annualizedReturn('2023-01-01', '2023-01-01', 0.05);
		}).toThrow(/endDate/);
	});

	test('should handle zero return rate', () => {
		const result = annualizedReturn('2023-01-01', '2023-07-01', 0);
		expect(result).toBe(0);
	});
});
