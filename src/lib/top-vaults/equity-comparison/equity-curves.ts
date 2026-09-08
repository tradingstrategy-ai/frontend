import type { TimeInterval } from 'd3-time';
import { getDataRange, resampleTimeSeries } from '$lib/charts/helpers';
import { TimeSpans } from '$lib/charts/time-span';
import { annualizedReturn } from '$lib/helpers/financial';
import {
	comparisonTimeSpanKeys,
	type ComparisonChartPoint,
	type ComparisonPeriodMetrics,
	type ComparisonTimeBucket,
	type ComparisonTimeSpan
} from './types';

/** Convert raw prices to a clean equity index beginning at 100. */
export function indexPriceSeries(points: readonly [number, number][]): ComparisonChartPoint[] {
	const pointsByTimestamp = new Map<number, number>();

	for (const [timestamp, price] of points) {
		if (!Number.isFinite(timestamp) || !Number.isFinite(price) || price <= 0) continue;
		pointsByTimestamp.set(timestamp, price);
	}

	const validPoints = [...pointsByTimestamp.entries()].sort(([left], [right]) => left - right);
	const firstPrice = validPoints[0]?.[1];
	if (!firstPrice) return [];

	return validPoints.map(([time, price]) => ({ time, value: (price / firstPrice) * 100 }));
}

/** Rebase a visible return series so its first plotted observation is index 100. */
export function rebaseComparisonPoints(points: readonly ComparisonChartPoint[]): ComparisonChartPoint[] {
	const startingValue = points[0]?.value;
	if (!Number.isFinite(startingValue) || startingValue <= 0) return [];

	return points.map((point) => ({ ...point, value: (point.value / startingValue) * 100 }));
}

/** Return the observations contained in a selected chart range. */
export function getVisibleComparisonPoints(
	points: readonly ComparisonChartPoint[],
	visibleRange: [number, number] | null
): ComparisonChartPoint[] {
	if (!visibleRange) return [];
	return points.filter(({ time }) => time >= visibleRange[0] && time <= visibleRange[1]);
}

/**
 * Anchor later-starting vault curves to the highest older curve that overlaps
 * their first visible observation. The earliest visible curve starts at 100.
 */
export function alignVisibleVaultCurves(
	curves: readonly (readonly ComparisonChartPoint[])[]
): ComparisonChartPoint[][] {
	const prepared = curves
		.map((points, index) => ({ index, points }))
		.filter(({ points }) => {
			const firstValue = points[0]?.value;
			return Number.isFinite(firstValue) && firstValue > 0;
		})
		.sort((left, right) => left.points[0].time - right.points[0].time || left.index - right.index);
	const alignedByIndex = new Map<number, ComparisonChartPoint[]>();
	let index = 0;

	while (index < prepared.length) {
		const cohortStart = prepared[index].points[0].time;
		const cohort: (typeof prepared)[number][] = [];
		while (index < prepared.length && prepared[index].points[0].time === cohortStart) cohort.push(prepared[index++]);

		const overlappingValues = [...alignedByIndex.values()].flatMap((points) => {
			const lastPoint = points.at(-1);
			if (!lastPoint || lastPoint.time < cohortStart) return [];
			const value = valueAtOrBefore(points, cohortStart);
			return value === null ? [] : [value];
		});
		const anchor = overlappingValues.length ? Math.max(...overlappingValues) : 100;

		for (const curve of cohort) {
			const startingValue = curve.points[0].value;
			alignedByIndex.set(
				curve.index,
				curve.points.map((point) => ({ ...point, value: (point.value / startingValue) * anchor }))
			);
		}
	}

	return curves.map((_, index) => alignedByIndex.get(index) ?? []);
}

/**
 * Resample an indexed series on the server, forward-filling the latest point.
 *
 * @param points Complete indexed history
 * @param interval Output time interval
 */
export function resampleComparisonPoints(
	points: readonly ComparisonChartPoint[],
	interval: TimeInterval
): ComparisonChartPoint[] {
	if (points.length < 2) return points.map((point) => ({ ...point }));

	const result: ComparisonChartPoint[] = [{ ...points[0] }];
	const lastMs = points.at(-1)!.time * 1000;
	let sourceIndex = 0;
	let current = interval.ceil(new Date(points[0].time * 1000));

	while (current.getTime() <= lastMs) {
		const timestamp = current.getTime() / 1000;
		while (sourceIndex < points.length - 1 && points[sourceIndex + 1].time <= timestamp) sourceIndex++;
		const source = points[sourceIndex];
		if (timestamp > result.at(-1)!.time) result.push({ ...source, time: timestamp });
		current = interval.offset(current);
	}

	const lastPoint = points.at(-1)!;
	if (lastPoint.time > result.at(-1)!.time) result.push({ ...lastPoint });
	return result;
}

function valueAtOrBefore(points: readonly ComparisonChartPoint[], timestamp: number): number | null {
	let low = 0;
	let high = points.length - 1;
	let match = -1;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		if (points[middle].time <= timestamp) {
			match = middle;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	return match === -1 ? null : points[match].value;
}

/**
 * Calculate chart-window CAGR and first plotted date for every comparison period.
 *
 * @param points Server-resampled chart points
 * @param range Complete comparison chart range
 */
export function calculateComparisonPeriodMetrics(
	points: Record<ComparisonTimeBucket, ComparisonChartPoint[]>,
	range: [number, number]
): Record<ComparisonTimeSpan, ComparisonPeriodMetrics> {
	const metrics = {} as Record<ComparisonTimeSpan, ComparisonPeriodMetrics>;

	for (const key of comparisonTimeSpanKeys) {
		const timeSpan = TimeSpans.get(key);
		const rangeDriver = resampleTimeSeries(
			[
				[range[0], 100],
				[range[1], 100]
			],
			timeSpan.interval
		);
		const visibleRange = getDataRange(rangeDriver, timeSpan);
		const periodPoints = visibleRange
			? points[timeSpan.timeBucket as ComparisonTimeBucket].filter(
					(point) => point.time >= visibleRange[0].getTime() / 1_000 && point.time <= visibleRange[1].getTime() / 1_000
				)
			: [];
		const first = periodPoints[0];
		const last = periodPoints.at(-1);
		let cagr: number | null = null;

		if (first && last && last.time > first.time && first.value > 0 && last.value > 0) {
			const annualised = annualizedReturn(
				new Date(first.time * 1_000),
				new Date(last.time * 1_000),
				last.value / first.value - 1
			);
			if (annualised !== undefined && Number.isFinite(annualised)) cagr = annualised;
		}

		metrics[key] = {
			cagr,
			since: first ? new Date(first.time * 1_000).toISOString().slice(0, 10) : null
		};
	}

	return metrics;
}
