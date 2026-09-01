import type { TimeInterval } from 'd3-time';
import { getDataRange, resampleTimeSeries } from '$lib/charts/helpers';
import { TimeSpans } from '$lib/charts/time-span';
import { annualizedReturn } from '$lib/helpers/financial';
import {
	comparisonTimeSpanKeys,
	type AlignedEquityPoint,
	type AlignedVaultSeries,
	type ComparisonChartPoint,
	type ComparisonPeriodMetrics,
	type ComparisonTimeBucket,
	type ComparisonTimeSpan,
	type VaultPriceSeries
} from './types';

interface PreparedSeries {
	id: string;
	selectionIndex: number;
	points: [number, number][];
}

function prepareSeries(series: VaultPriceSeries, selectionIndex: number): PreparedSeries | null {
	const pointsByTimestamp = new Map<number, number>();

	for (const [timestamp, price] of series.points) {
		if (!Number.isFinite(timestamp) || !Number.isFinite(price) || price <= 0) continue;
		pointsByTimestamp.set(timestamp, price);
	}

	const points = [...pointsByTimestamp.entries()].sort(([left], [right]) => left - right);
	return points.length ? { id: series.id, selectionIndex, points } : null;
}

function valueAtOrBefore(points: AlignedEquityPoint[], timestamp: number): number | null {
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

function alignSeries(series: PreparedSeries, anchor: number, discontinuous: boolean): AlignedVaultSeries {
	const firstPrice = series.points[0][1];
	return {
		id: series.id,
		anchor,
		discontinuous,
		points: series.points.map(([time, rawPrice]) => ({
			time,
			value: (rawPrice / firstPrice) * anchor
		}))
	};
}

/**
 * Convert raw vault prices to comparable indexed equity curves.
 *
 * The oldest cohort starts at 100. Each younger cohort starts at the highest
 * value among older curves which still cover its first timestamp.
 */
export function alignVaultEquityCurves(series: readonly VaultPriceSeries[]): AlignedVaultSeries[] {
	const prepared = series
		.map(prepareSeries)
		.filter((value): value is PreparedSeries => value !== null)
		.sort((left, right) => left.points[0][0] - right.points[0][0] || left.selectionIndex - right.selectionIndex);

	const alignedById = new Map<string, AlignedVaultSeries>();
	let index = 0;

	while (index < prepared.length) {
		const cohortStart = prepared[index].points[0][0];
		const cohort: PreparedSeries[] = [];
		while (index < prepared.length && prepared[index].points[0][0] === cohortStart) {
			cohort.push(prepared[index++]);
		}

		let anchor = 100;
		let discontinuous = alignedById.size > 0;
		if (alignedById.size > 0) {
			const overlappingValues: number[] = [];
			for (const older of alignedById.values()) {
				const lastPoint = older.points.at(-1);
				if (!lastPoint || lastPoint.time < cohortStart) continue;
				const value = valueAtOrBefore(older.points, cohortStart);
				if (value !== null) overlappingValues.push(value);
			}

			if (overlappingValues.length) {
				anchor = Math.max(...overlappingValues);
				discontinuous = false;
			}
		}

		for (const member of cohort) alignedById.set(member.id, alignSeries(member, anchor, discontinuous));
	}

	return series.flatMap(({ id }) => {
		const aligned = alignedById.get(id);
		return aligned ? [aligned] : [];
	});
}

/** Convert a market-price series to an equity index beginning at `startingValue`. */
export function indexBenchmarkPrices(points: readonly [number, number][], startingValue = 100): [number, number][] {
	const valid = points.filter(
		(point): point is [number, number] => Number.isFinite(point[0]) && Number.isFinite(point[1]) && point[1] > 0
	);
	if (!valid.length || startingValue <= 0) return [];
	const firstPrice = valid[0][1];
	return valid.map(([timestamp, price]) => [timestamp, (price / firstPrice) * startingValue]);
}

/**
 * Resample an aligned series on the server, forward-filling the latest point.
 *
 * @param points Complete aligned history
 * @param interval Output time interval
 */
export function resampleComparisonPoints(
	points: readonly AlignedEquityPoint[],
	interval: TimeInterval
): ComparisonChartPoint[] {
	if (points.length < 2) return points.map(toComparisonChartPoint);

	const result: ComparisonChartPoint[] = [toComparisonChartPoint(points[0])];
	const lastMs = points.at(-1)!.time * 1000;
	let sourceIndex = 0;
	let current = interval.ceil(new Date(points[0].time * 1000));

	while (current.getTime() <= lastMs) {
		const timestamp = current.getTime() / 1000;
		while (sourceIndex < points.length - 1 && points[sourceIndex + 1].time <= timestamp) sourceIndex++;
		const source = points[sourceIndex];
		if (timestamp > result.at(-1)!.time) result.push({ ...toComparisonChartPoint(source), time: timestamp });
		current = interval.offset(current);
	}

	const lastPoint = points.at(-1)!;
	if (lastPoint.time > result.at(-1)!.time) result.push(toComparisonChartPoint(lastPoint));
	return result;
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

function toComparisonChartPoint(point: AlignedEquityPoint): ComparisonChartPoint {
	return { time: point.time, value: point.value };
}
