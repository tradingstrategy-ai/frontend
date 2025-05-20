import { isNumber } from '$lib/helpers/formatters';
import { type ParsableDate, parseDate } from './date';

const MS_IN_YEAR = 365 * 24 * 60 * 60 * 1000;

/**
 * Calculate a relative return from given start/end return values
 *
 * @param start - starting return for a given period
 * @param end - ending return for the time period
 * @returns the relative return
 */
export function relativeReturn(start: MaybeNumber, end: MaybeNumber) {
	if (isNumber(start) && isNumber(end)) {
		return (end - start) / (1 + start);
	}
}

/**
 * Calculate the annualized rate of return between two dates.
 *
 * This function converts a return rate for a specific time period into an equivalent annual
 * rate, accounting for compounding effects.
 *
 * The standard financial formula for annualizing returns is used; see:
 * https://www.investopedia.com/terms/a/annualized-total-return.asp
 *
 * @param start - The starting date of the investment period
 * @param end - The ending date of the investment period
 * @param returnRate - The decimal return rate experienced over the period (e.g., 0.05 for 5%)
 */
export function annualizedReturn(start: ParsableDate, end: ParsableDate, returnRate: number) {
	const startDate = parseDate(start);
	const endDate = parseDate(end);

	if (!startDate || !endDate) return undefined;
	if (endDate < startDate) throw new Error('endDate must be equal to or later than startDate');

	return (1 + returnRate) ** (MS_IN_YEAR / (+endDate - +startDate)) - 1;
}
