import { isNumber, toFloatingPoint } from '$lib/helpers/formatters';

/**
 * Determine profitability above/below threshold
 * returns -1 (loss) | 0 (neutral) | +1 (profit)
 *
 */
export function determineProfitability(value: MaybeNumberlike): number {
	return Math.sign(toFloatingPoint(value) || 0);
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
