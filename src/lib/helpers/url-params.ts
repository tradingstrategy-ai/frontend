import { parseDate } from './date';

/**
 * Get a string value from URLSearchParams, validated against a list of options.
 *
 * If a defaultValue is not specified, the first option from the valid options is used.
 */
export function getStringParam<T extends readonly string[]>(
	searchParams: URLSearchParams,
	key: string,
	options: T,
	defaultValue?: T[number]
): T[number] {
	const param = searchParams.get(key);
	const fallback = defaultValue ?? options[0];
	return options.includes(param as T[number]) ? (param as T[number]) : fallback;
}

/**
 * Get a numeric value from URLSearchParams
 */
export function getNumberParam(searchParams: URLSearchParams, key: string, defaultValue: number) {
	return Number(searchParams.get(key)) || defaultValue;
}

/**
 * Get a date value from URLSearchParams
 */
export function getDateParam(searchParams: URLSearchParams, key: string) {
	return parseDate(searchParams.get(key));
}
