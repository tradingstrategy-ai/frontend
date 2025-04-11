import type { TimeInterval } from 'd3-time';
import type { UTCTimestamp } from 'lightweight-charts';
import type { CandleTimeBucket, SimpleDataItem } from './types';
import { type MaybeParsableDate, parseDate } from '$lib/helpers/date';
import { notFilledMarker } from '$lib/helpers/formatters';

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
 * Normalize data with non-standard or inconsistent date intervals to a standard interval
 *
 * @param data Raw tick data
 * @param interval A d3 time interval
 */
export function normalizeDataForInterval(data: [Date, number][], interval: TimeInterval): SimpleDataItem[] {
	const normalized = data.reduce((acc, [date, value]) => {
		const normalizedTs = dateToTs(interval.floor(date));
		const lastAddedTs = acc.at(-1)?.time;
		if (normalizedTs === lastAddedTs) acc.pop();
		acc.push({ time: normalizedTs, value });
		return acc;
	}, [] as SimpleDataItem[]);

	// prepend entry for prior interval (if needed) so starting value doesn't get swallowed
	if (data[0] && normalized[0] && data[0][1] !== normalized[0].value) {
		const priorInterval = interval.offset(tsToDate(normalized[0].time), -1);
		normalized.unshift({ time: dateToTs(priorInterval), value: data[0][1] });
	}

	return normalized;
}

export function dateToTs(date: Date) {
	return (date.valueOf() / 1000) as UTCTimestamp;
}

export function tsToDate(ts: number) {
	return new Date(ts * 1000);
}
