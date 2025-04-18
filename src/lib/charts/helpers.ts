import type { TimeInterval } from 'd3-time';
import type { UTCTimestamp } from 'lightweight-charts';
import type { CandleTimeBucket, SimpleDataItem } from './types';
import { type MaybeParsableDate, parseDate } from '$lib/helpers/date';
import { notFilledMarker } from '$lib/helpers/formatters';
import type { UnixTimestamp } from 'trade-executor/schemas/utility-types';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'UTC',
	year: 'numeric',
	month: 'short',
	day: '2-digit'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'UTC',
	year: 'numeric',
	month: 'short',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	timeZoneName: 'short'
});

const monthYearFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'UTC',
	month: 'short',
	year: '2-digit'
});

/**
 * Format a possible date value for with the relevant units for a given time bucket.
 *
 * @param dateValue a possible date value (see `parseDate`)
 * @param timeBucket a candle time bucket such as 15m, 4h, 1d
 * @returns a formatted date or fallback string
 */
export function formatDate(dateValue: MaybeParsableDate, timeBucket: CandleTimeBucket) {
	const date = parseDate(dateValue);
	const formatter = timeBucket.endsWith('d') ? dateFormatter : dateTimeFormatter;
	return date ? formatter.format(date) : notFilledMarker;
}

/**
 * Format a timestamp as "Feb ‘25"
 */
export function formatMonthYear(ts: UTCTimestamp) {
	const date = tsToDate(ts);
	return monthYearFormatter.format(date).replace(' ', ' ‘');
}

/**
 * Generator function for iterating over all of the dates in a range (inclusive).
 * The start/end dates are normalized to nearest `floor` values.
 *
 * @param interval a d3 time interval
 * @param startDate starting date for iterator
 * @param endDate ending date for iterator
 *
 * @yields An object containing `current` and `next` Date values
 *
 */
export function* intervalRange(interval: TimeInterval, startDate: Date, endDate: Date) {
	let current = interval.floor(startDate);
	const lastIntervalDate = interval.floor(endDate);

	while (current <= lastIntervalDate) {
		const next = interval.offset(current);
		yield { current, next };
		current = next;
	}
}

/**
 * Normalize data with non-standard or inconsistent date intervals to a standard interval
 *
 * @param data Raw tick data
 * @param interval A d3 time interval
 */
export function normalizeDataForInterval(data: [UnixTimestamp, number][], interval: TimeInterval): SimpleDataItem[] {
	if (data.length === 0) return [];

	const normalized: SimpleDataItem[] = [];
	const start = tsToDate(data[0][0]);
	const end = tsToDate(data.at(-1)![0]);

	let dataIndex = 0;
	let value = 0;

	for (const { current, next } of intervalRange(interval, start, end)) {
		// find the last value in original data within the current interval
		while (dataIndex < data.length && tsToDate(data[dataIndex][0]) < next) {
			value = data[dataIndex][1];
			dataIndex++;
		}
		normalized.push({ time: dateToTs(current), value });
	}

	// prepend entry for prior interval (if needed) so starting value doesn't get swallowed
	if (data[0][1] !== normalized[0].value) {
		const previous = interval.offset(tsToDate(normalized[0].time), -1);
		normalized.unshift({ time: dateToTs(previous), value: data[0][1] });
	}

	return normalized;
}

export function dateToTs(date: Date) {
	return (date.valueOf() / 1000) as UTCTimestamp;
}

export function tsToDate(ts: number) {
	return new Date(ts * 1000);
}
