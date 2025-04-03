import { isNumber } from '$lib/helpers/formatters';

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
