import { isNumber } from '$lib/helpers/formatters';

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
