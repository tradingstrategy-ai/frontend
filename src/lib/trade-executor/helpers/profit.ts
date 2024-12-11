import { isNumber, toFloatingPoint, formatPercent } from '$lib/helpers/formatters';

/**
 * Determine profitability above/below threshold
 *
 * Neutral if profitability rounds to 0.0%
 *
 * @return -1 (loss) | 0 (neutral) | +1 (profit)
 *
 */
export function determineProfitability(n: MaybeNumberlike): number {
	const value = toFloatingPoint(n) ?? 0;

	// use formatter to get properly rounded value
	const percentStr = formatPercent(value);

	// neutral if rounds to zero; otherwise return sign of the value
	return percentStr === '0.0%' ? 0 : Math.sign(value);
}

/**
 * Calculate a relative profitability percent for a given time period
 *
 * @param start - starting profitability percent for a given period
 * @param end - ending profitability percent for the time period
 * @returns the relative profitability for the time period
 */
export function relativeProfitability(start: MaybeNumber, end: MaybeNumber) {
	if (isNumber(start) && isNumber(end)) {
		return (end - start) / (1 + start);
	}
}
