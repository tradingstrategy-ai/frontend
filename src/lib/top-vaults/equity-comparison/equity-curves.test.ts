import { utcHour } from 'd3-time';
import {
	alignVaultEquityCurves,
	calculateComparisonPeriodMetrics,
	indexBenchmarkPrices,
	resampleComparisonPoints
} from './equity-curves';

describe('alignVaultEquityCurves', () => {
	test('indexes the oldest vault to 100', () => {
		const [vault] = alignVaultEquityCurves([
			{
				id: 'old',
				points: [
					[1, 2],
					[2, 3]
				]
			}
		]);
		expect(vault.anchor).toBe(100);
		expect(vault.points.map(({ value }) => value)).toEqual([100, 150]);
	});

	test('anchors a younger vault to the highest overlapping curve', () => {
		const result = alignVaultEquityCurves([
			{
				id: 'lower',
				points: [
					[1, 1],
					[3, 0.9],
					[5, 1]
				]
			},
			{
				id: 'higher',
				points: [
					[1, 2],
					[3, 3],
					[5, 4]
				]
			},
			{
				id: 'young',
				points: [
					[4, 10],
					[5, 12]
				]
			}
		]);
		const young = result.find(({ id }) => id === 'young')!;
		expect(young.anchor).toBe(150);
		expect(young.points[0].value).toBe(150);
		expect(young.points[1].value).toBe(180);
		expect(young.points[0].time).toBe(4);
	});

	test('aligns same-start cohorts without processing-order bias', () => {
		const result = alignVaultEquityCurves([
			{
				id: 'first',
				points: [
					[1, 1],
					[2, 2]
				]
			},
			{
				id: 'second',
				points: [
					[1, 5],
					[2, 4]
				]
			}
		]);
		expect(result.map(({ anchor }) => anchor)).toEqual([100, 100]);
	});

	test('falls back to 100 for non-overlapping histories', () => {
		const result = alignVaultEquityCurves([
			{
				id: 'finished',
				points: [
					[1, 1],
					[2, 2]
				]
			},
			{
				id: 'later',
				points: [
					[4, 5],
					[5, 6]
				]
			}
		]);
		expect(result[1]).toMatchObject({ anchor: 100, discontinuous: true });
	});

	test('sorts, de-duplicates, and removes invalid samples', () => {
		const [vault] = alignVaultEquityCurves([
			{
				id: 'vault',
				points: [
					[2, 4],
					[1, 2],
					[2, 6],
					[3, 0],
					[4, Number.NaN]
				]
			}
		]);
		expect(vault.points.map(({ time, value }) => [time, value])).toEqual([
			[1, 100],
			[2, 300]
		]);
	});
});

describe('indexBenchmarkPrices', () => {
	test('indexes valid market prices to the requested starting value', () => {
		expect(
			indexBenchmarkPrices(
				[
					[1, 20],
					[2, 25]
				],
				100
			)
		).toEqual([
			[1, 100],
			[2, 125]
		]);
	});
});

describe('resampleComparisonPoints', () => {
	test('prepares forward-filled chart points at the requested server-side interval', () => {
		const [series] = alignVaultEquityCurves([
			{
				id: 'vault',
				points: [
					[0, 1],
					[3 * 3_600, 1.1],
					[8 * 3_600, 1.2]
				]
			}
		]);

		const points = resampleComparisonPoints(series.points, utcHour.every(4)!);
		expect(points.map(({ time, value }) => [time, value])).toEqual([
			[0, 100],
			[4 * 3_600, 110.00000000000001],
			[8 * 3_600, 120]
		]);
	});
});

describe('calculateComparisonPeriodMetrics', () => {
	const day = 86_400;
	const start = Date.UTC(2024, 0, 1) / 1_000;
	const end = start + 400 * day;
	const point = (time: number, value: number) => ({ time, value });

	test('calculates CAGR and since date for each visible chart period', () => {
		const dailyPoints = Array.from({ length: 401 }, (_, index) => point(start + index * day, 100 + index / 4));
		const metrics = calculateComparisonPeriodMetrics(
			{
				'4h': dailyPoints,
				'1d': dailyPoints
			},
			[start, end]
		);

		expect(metrics.Max.since).toBe('2024-01-01');
		expect(metrics.Max.cagr).toBeCloseTo(0.882, 3);
		expect(metrics['1M'].since).toBe('2025-01-06');
		expect(metrics['1M'].cagr).toBeCloseTo(0.592, 3);
	});

	test('uses a younger vault first plotted point as its since date', () => {
		const youngerStart = start + 350 * day;
		const youngerPoints = [point(youngerStart, 150), point(end, 165)];
		const metrics = calculateComparisonPeriodMetrics(
			{
				'4h': youngerPoints,
				'1d': youngerPoints
			},
			[start, end]
		);

		expect(metrics['3M'].since).toBe('2024-12-16');
		expect(metrics['3M'].cagr).toBeCloseTo(1.005, 3);
	});
});
