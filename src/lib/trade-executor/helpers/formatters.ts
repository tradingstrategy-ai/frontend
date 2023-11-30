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

	const absN = Math.abs(n);
	const symbol = absN < PROFITABILITY_THRESHOLD ? '◼︎' : n > 0 ? '▲' : '▼';
	const percentStr = formatNumber(absN, 1, 1, { style: 'percent' });
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
