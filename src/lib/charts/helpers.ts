import type { CandleTimeBucket } from './types';
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
