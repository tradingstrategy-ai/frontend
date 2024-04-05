import type { TimeInterval } from 'd3-time';
import { extent } from 'd3-array';
import { type ParsableDate, parseDate } from '$lib/helpers/date';

export type RawTick = [ParsableDate, MaybeNumber];

export type Candle = {
	ts: string;
	o: number;
	h: number;
	l: number;
	c: number;
	v?: number;
	[key: string]: any;
};

export type Quote = {
	DT: Date | string;
	Value?: MaybeNumber;
	Open?: MaybeNumber;
	High?: MaybeNumber;
	Low?: MaybeNumber;
	Close?: MaybeNumber;
	ClippedHigh?: MaybeNumber;
	ClippedLow?: MaybeNumber;
	Volume?: MaybeNumber;
	[key: string]: any;
};

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month';
export type TimeUnitAbbrev = 'm' | 'h' | 'd' | 'w' | 'M';
export type TimeBucket = `${number}${TimeUnitAbbrev}`;
export type Periodicity = {
	period: number;
	interval: number;
	timeUnit: TimeUnit;
};

/**
 * Normalize data with non-standard or inconsistent date intervals to a standard interval
 *
 * @param data Raw tick data
 * @param interval A d3 time interval
 */
export function normalizeDataForInterval(data: RawTick[], interval: TimeInterval) {
	return data.reduce((acc, [ts, Value]) => {
		const date = parseDate(ts);
		if (!date) return acc;
		const normalizedDate = interval.floor(date);
		const lastAddedDate = acc.at(-1)?.DT;
		if (normalizedDate.valueOf() === lastAddedDate?.valueOf()) {
			acc.pop();
		}
		acc.push({ DT: normalizedDate, Value });
		return acc;
	}, [] as Quote[]);
}

export function rawTicksToQuotes(data: RawTick[]): Quote[] {
	return data.map(([ts, Value]) => ({ DT: parseDate(ts)!, Value }));
}

/**
 * Convert ChartIQ periodicity object to Trading Strategy TimeBucket
 */
export function periodicityToTimeBucket({ period, interval, timeUnit }: Periodicity): TimeBucket | undefined {
	switch (timeUnit) {
		case 'minute':
			return interval === 60 ? `${period}h` : `${interval}m`;
		case 'day':
			return `${interval}d`;
		case 'week':
			return `${interval * 7}d`;
		case 'month':
			return `${interval * 30}d`;
	}
}

/**
 * Convert Trading Strategy TimeBucket to ChartIQ periodicity object
 */
export function timeBucketToPeriodicity(bucket: TimeBucket): Periodicity | undefined {
	const [durationStr, timeUnitAbbrev] = bucket.split(/(?=[mhd])/);
	const duration = Number.parseInt(durationStr, 10);

	switch (timeUnitAbbrev) {
		case 'm':
			return { period: 1, interval: duration, timeUnit: 'minute' };
		case 'h':
			return { period: duration, interval: 60, timeUnit: 'minute' };
		case 'd':
			return interDayPeriodicity(duration);
	}
}

function interDayPeriodicity(days: number): Periodicity {
	switch (days) {
		case 7:
			return { period: 1, interval: 1, timeUnit: 'week' };
		case 30:
			return { period: 1, interval: 1, timeUnit: 'month' };
		default:
			return { period: 1, interval: days, timeUnit: 'day' };
	}
}

/**
 * Calculate a y-axis range to fit the provided chart data
 *
 * @param quotes chart data
 * @param paddingPct padding percentage to apply to top/bottom of the data range
 * @param minHeight minimum height of the y-axis
 * @returns tuple of [min, max]
 */
export function calculateYAxisRange(quotes: Quote[], paddingPct: number, minHeight: number) {
	const [min = 0, max = 0] = extent(quotes, ({ Value }) => Value);
	const quoteHeight = max - min;
	const paddedHeight = quoteHeight * (1 + paddingPct);
	const height = Math.max(paddedHeight, minHeight);
	const heightDelta = (height - quoteHeight) / 2;
	return [min - heightDelta, max + heightDelta];
}
