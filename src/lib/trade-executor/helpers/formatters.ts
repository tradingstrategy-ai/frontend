/**
 * Formatting helpers specific to trade execution
 *
 * (see $lib/helpers/formatters for other general-use formatters)
 */
import { formatDollar, formatNumber, toFloatingPoint, isNumber, notFilledMarker } from '$lib/helpers/formatters';
import { PROFITABILITY_THRESHOLD } from './profit';

/**
 * Format extreme large or small amounts human friendly manner.
 *
 * Useful to display token amounts.
 *
 * @param n - number to format
 * @param minDigits - minimum number of digits to display (default = 2)
 * @param maxPrecision - maximum number of significant digits (default = minDigits)
 */
export function formatTokenAmount(n: MaybeNumberlike, minDigits = 2, maxPrecision = minDigits) {
	// Token quantities come from the API as strings. Because JavaScript numbers (IEEE 754 floats)
	// cannot represent quantities accurately, some precision may be lost in the conversion.
	return formatDollar(n, minDigits, maxPrecision, false);
}

/**
 * Format how much profit a position has made.
 * @param n - number to format
 */
export function formatProfitability(n: MaybeNumberlike): string {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;

	const abs = Math.abs(n);
	const symbol = abs < PROFITABILITY_THRESHOLD ? '◼︎' : n > 0 ? '▲' : '▼';
	const percentStr = abs.toLocaleString('en-US', {
		style: 'percent',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
	return `${symbol} ${percentStr}`;
}

/**
 * Format basis points (BPS)
 *
 * No unit suffix added.
 *
 * @param n - decimal value to format as basis points
 */
export function formatBPS(n: MaybeNumber) {
	return formatNumber(n * 10_000, 0);
}

/**
 * Formats trades per month frequency.
 */
export function formatTradesPerMonth(n: MaybeNumberlike): string {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;
	return formatNumber(n, 1, 2) + ' / mo';
}

const timeUnitMap: Record<string, string> = {
	m: 'minute',
	h: 'hour',
	d: 'day'
};

/**
 * Formats cycle duration into a human-friendly string
 *
 * @param cycleDuration - cycle duration string, e.g. '1h', '7d'
 */
export function formatCycleDuration(cycleDuration?: string): string {
	if (!cycleDuration) return notFilledMarker;
	const [durationStr, abbrev] = cycleDuration.split(/(?=[mhd])/);
	const duration = Number.parseInt(durationStr);
	let timeUnit = timeUnitMap[abbrev];
	if (timeUnit && duration > 1) timeUnit += 's';
	return `${duration} ${timeUnit ?? abbrev}`;
}
