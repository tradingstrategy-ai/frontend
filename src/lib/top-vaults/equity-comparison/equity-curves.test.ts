import { utcHour } from 'd3-time';
import {
	alignVisibleVaultCurves,
	calculateComparisonPeriodMetrics,
	getVisibleComparisonPoints,
	indexPriceSeries,
	rebaseComparisonPoints,
	resampleComparisonPoints
} from './equity-curves';

describe('indexPriceSeries', () => {
	test('indexes a valid price series to 100', () => {
		expect(
			indexPriceSeries([
				[1, 2],
				[2, 3]
			])
		).toEqual([
			{ time: 1, value: 100 },
			{ time: 2, value: 150 }
		]);
	});

	test('sorts, de-duplicates, and removes invalid samples', () => {
		expect(
			indexPriceSeries([
				[2, 4],
				[1, 2],
				[2, 6],
				[3, 0],
				[4, Number.NaN]
			])
		).toEqual([
			{ time: 1, value: 100 },
			{ time: 2, value: 300 }
		]);
	});
});

describe('rebaseComparisonPoints', () => {
	test('rebases the first visible observation to index 100 without losing fee markers', () => {
		expect(
			rebaseComparisonPoints([
				{ time: 86_400, value: 125, feeEvent: 'after-entry' },
				{ time: 2 * 86_400, value: 150 }
			])
		).toEqual([
			{ time: 86_400, value: 100, feeEvent: 'after-entry' },
			{ time: 2 * 86_400, value: 120 }
		]);
	});

	test('does not produce a return index from a non-positive starting value', () => {
		expect(rebaseComparisonPoints([{ time: 86_400, value: 0 }])).toEqual([]);
	});

	test('keeps only observations inside the selected range', () => {
		expect(
			getVisibleComparisonPoints(
				[
					{ time: 1, value: 80 },
					{ time: 3, value: 120 },
					{ time: 4, value: 150 }
				],
				[2, 4]
			)
		).toEqual([
			{ time: 3, value: 120 },
			{ time: 4, value: 150 }
		]);
	});
});

describe('alignVisibleVaultCurves', () => {
	test('anchors a vault with shorter history to the highest overlapping curve', () => {
		expect(
			alignVisibleVaultCurves([
				[
					{ time: 1, value: 50 },
					{ time: 2, value: 60 },
					{ time: 3, value: 40 }
				],
				[
					{ time: 1, value: 10 },
					{ time: 2, value: 13 },
					{ time: 3, value: 17 }
				],
				[
					{ time: 2, value: 200 },
					{ time: 3, value: 250 }
				]
			])
		).toEqual([
			[
				{ time: 1, value: 100 },
				{ time: 2, value: 120 },
				{ time: 3, value: 80 }
			],
			[
				{ time: 1, value: 100 },
				{ time: 2, value: 130 },
				{ time: 3, value: 170 }
			],
			[
				{ time: 2, value: 130 },
				{ time: 3, value: 162.5 }
			]
		]);
	});
});

describe('resampleComparisonPoints', () => {
	test('prepares forward-filled chart points at the requested server-side interval', () => {
		const points = resampleComparisonPoints(
			[
				{ time: 0, value: 100 },
				{ time: 3 * 3_600, value: 110 },
				{ time: 8 * 3_600, value: 120 }
			],
			utcHour.every(4)!
		);
		expect(points.map(({ time, value }) => [time, value])).toEqual([
			[0, 100],
			[4 * 3_600, 110],
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
