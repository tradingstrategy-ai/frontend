export type ParsableDate = Date | string | number;
export type MaybeParsableDate = Maybe<ParsableDate>;

// Regex to identify unqualified (local) ISO date strings (e.g. "2023-01-01T12:00")
// JS date parser treats these as local time unless tz offset is appended
// see https://en.wikipedia.org/wiki/ISO_8601#Local_time_(unqualified)
const isoLocalDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

/**
 * Try to parse a value as a date. Gracefully handles string values,
 * Unix epoch values (no ms), JS style numeric values (with ms),
 * and ISO date strings, with or without tz offset (coerced to UTC).
 */
export function parseDate(value: MaybeParsableDate) {
	if (value instanceof Date) return value;
	if (value === null || value === undefined) return undefined;

	// numeric values (may come from server as string type)
	let numVal = Number(value);
	if (Number.isFinite(numVal)) {
		// heuristic to determine is this is a Unix epoch value (no ms)
		if (numVal < 10_000_000_000) numVal *= 1000;
		return new Date(numVal);
	}

	// string values
	if (typeof value === 'string') {
		// check for unqualified (local) ISO date strings (see above)
		// append "Z" to ensure JS Date parser treats these as UTC
		if (isoLocalDateRegex.test(value)) {
			value += 'Z';
		}
		const parsedDate = new Date(value);
		// only return valid parsed dates
		return Number.isFinite(parsedDate.valueOf()) ? parsedDate : undefined;
	}
}

/**
 * Return a date range (as two-date array) from a initial date and number of days.
 * The time component is stripped from the original `date`. `days` may be positive
 * (future) or negative (past). Range is always returned in ascending order.
 */
export function getUTCDateRange(date: Date, days: number) {
	const d1 = floorUTCDate(date);
	const d2 = addUTCDays(d1, days - Math.sign(days));
	return days > 0 ? [d1, d2] : [d2, d1];
}

/**
 * Return a new date at midnight UTC of the original date (time component stripped)
 */
export function floorUTCDate(date: Date) {
	const floor = new Date(date);
	floor.setUTCHours(0, 0, 0, 0);
	return floor;
}

/**
 * Return a new date with `days` added (may be negative to subtract days).
 * Uses UTC date functions (which matters when crossing daylight-savings boundaries)
 */
export function addUTCDays(date: Date, days: number) {
	const d2 = new Date(date);
	d2.setUTCDate(d2.getUTCDate() + days);
	return d2;
}

/**
 * Return a new date at midnight UTC that is closest to original date
 */
export function roundUTCDate(date: Date) {
	const round = new Date(date);
	// round-half-up algorithm
	round.setUTCMilliseconds((24 * 60 * 60 * 1000) / 2);
	round.setUTCHours(0, 0, 0, 0);
	return round;
}
