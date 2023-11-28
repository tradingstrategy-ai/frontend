import { isNumber, toFloatingPoint } from '$lib/helpers/formatters';

// we need move needle 1 basis point (0.01%) before calling it moving
export const PROFITABILITY_THRESHOLD = 0.0001;

/**
 * Determine profitability above/below threshold
 * returns -1 (loss) | 0 (neither) | +1 (profit)
 *
 */
export function determineProfitability(value: MaybeNumberlike): number {
	value = toFloatingPoint(value);
	if (!value || Math.abs(value) < PROFITABILITY_THRESHOLD) {
		return 0;
	}
	return Math.sign(value);
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
