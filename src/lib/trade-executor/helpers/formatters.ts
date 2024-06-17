/**
 * Formatting helpers specific to trade execution
 *
 * (see $lib/helpers/formatters for other general-use formatters)
 */
import { formatNumber, formatPercent, toFloatingPoint, isNumber, notFilledMarker } from '$lib/helpers/formatters';

/**
 * Format how much profit a position has made.
 * @param n - number to format
 */
export function formatProfitability(n: MaybeNumberlike, minDigits = 1, maxPrecision = minDigits): string {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;

	const symbol = n === 0 ? '◼︎' : n > 0 ? '▲' : '▼';
	const percentStr = formatPercent(Math.abs(n), minDigits, maxPrecision);
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
