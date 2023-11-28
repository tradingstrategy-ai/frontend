export const notFilledMarker = '---';

// number of seconds per minute/hour/day; used duration formatters
const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

// thresholds for determining when to use scientific notation
const VERY_SMALL_USD_VALUE = 1e-6; // 0.000001
const VERY_LARGE_USD_VALUE = 1e15; // 1,000,000,000,000 = 1,000T
const VERY_SMALL_PERCENT = 1e-8; // 0.000001%
const VERY_LARGE_PERCENT = 1e4; // 1,000,000%

export function toFloatingPoint(n: MaybeNumberlike) {
	if (typeof n == 'string') {
		return parseFloat(n);
	}

	return n;
}

// Type predicate to help TypeScript properly narrow type to number
export function isNumber(n: MaybeNumber): n is number {
	return Number.isFinite(n);
}

// Check if number is extremely small or large
function isExtreme(n: number, small: number, large: number) {
	const absN = Math.abs(n);
	return n !== 0 && (absN < small || absN >= large);
}

/**
 * Convert number to thousands.
 *
 * No suffix added.
 */
export function formatKilos(n: MaybeNumber): string {
	if (!isNumber(n)) return notFilledMarker;

	if (n <= 1000) {
		return (n / 1000).toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
	} else {
		return (n / 1000).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
	}
}

/**
 * Format size in megabytes
 *
 * No suffix added.
 */
export function formatSizeMegabytes(n: MaybeNumber): string {
	if (!isNumber(n)) return notFilledMarker;

	if (n <= 1024 * 1024) {
		return (n / (1024 * 1024)).toLocaleString('en', {
			minimumFractionDigits: 3,
			maximumFractionDigits: 3
		});
	} else {
		return (n / (1024 * 1024)).toLocaleString('en', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}
}

/**
 * Format size in gigabyttes
 */
export function formatSizeGigabytes(n: MaybeNumber): string {
	if (!isNumber(n)) return notFilledMarker;

	if (n <= 1024 * 1024) {
		return (n / (1024 * 1024 * 1024)).toLocaleString('en', {
			minimumFractionDigits: 3,
			maximumFractionDigits: 3
		});
	} else {
		return (n / (1024 * 1024 * 1024)).toLocaleString('en', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	}
}

/**
 * Format large money amounts in human friendly manner.
 *
 * Crypto prices can vary highly between $1B to $0.00000001.
 * Use Intl.NumberFormat "compact" notation to format everything gracefully.
 * see: https://mdn.io/NumberFormat+constructor
 *
 * @param n - number to format
 * @param minDigits - minimum number of digits to display (default = 2)
 * @param maxPrecision - maximum number of significant digits (default = minDigits)
 * @param showPrefix - whether to show "$" prefix (default = true)
 */
export function formatDollar(n: MaybeNumberlike, minDigits = 2, maxPrecision = minDigits, showPrefix = true) {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;

	// If n is very small or large, use scientific notation
	const notation = isExtreme(n, VERY_SMALL_USD_VALUE, VERY_LARGE_USD_VALUE) ? 'scientific' : 'compact';
	const style = showPrefix ? 'currency' : 'decimal';
	const options: Intl.NumberFormatOptions = { notation, style, compactDisplay: 'short', currency: 'USD' };
	return formatNumber(n, minDigits, maxPrecision, options);
}

/**
 * Format a number with appropriate number of digits based on its magnitude.
 * - larger numbers display `minDigits` after the decimal point
 * - smaller numbers display from `minDigits` up to `maxPrecision`
 *   significant digits (to retain precision)
 *
 * @example
 * With minDigits and maxPrecision = 2 (the default):
 *    12      -> 12.00
 *     1.234  ->  1.23
 *     0.1    ->  0.10
 *     0.123  ->  0.12
 *     0.0123 ->  0.012
 *
 * @param n - number to format (Numberlike - may be a string)
 * @param minDigits - minimum number of digits to display (default = 2)
 * @param maxPrecision - maximum number of significant digits (default = minDigits)
 * @param options - additional options to pass through to `toLocaleString()`
 */
export function formatNumber(n: MaybeNumberlike, minDigits = 2, maxPrecision = minDigits, options = {}) {
	if (minDigits < 0) throw new RangeError('minDigits must be >= 0');
	if (maxPrecision < minDigits) throw new RangeError('maxPrecision must be >= minDigits');

	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;

	// Don't format -0.00
	// https://stackoverflow.com/a/7223395/315168
	if (Object.is(-0, n)) n = 0;

	// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
	// In theory, we should be able to use `roundingPriority: 'morePrecision'` to achieve
	// the same result, but this is inconsistent across JavaScript implementations.
	const v1 = n.toLocaleString('en-US', {
		minimumFractionDigits: minDigits,
		maximumFractionDigits: minDigits,
		...options
	});

	if (minDigits === 0 && maxPrecision === 0) return v1;

	const v2 = n.toLocaleString('en-US', {
		minimumSignificantDigits: minDigits || 1,
		maximumSignificantDigits: maxPrecision,
		...options
	});

	// return the formatted value with greatest precision
	return v2.length > v1.length ? v2 : v1;
}

/**
 * Format price with '$' prefix, thousands separator, and useful
 * number of digits.
 */
export function formatPrice(n: MaybeNumberlike, minDigits = 2, maxPrecision = 4) {
	maxPrecision = Math.max(minDigits, maxPrecision);
	return formatNumber(n, minDigits, maxPrecision, {
		style: 'currency',
		currency: 'USD'
	});
}

export function formatPriceChange(n: MaybeNumberlike, minDigits = 1, maxPrecision = minDigits) {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;
	return `${n > 0 ? '▲' : '▼'} ${formatPercent(Math.abs(n), minDigits, maxPrecision)}`;
}

/**
 * Format number using an English thousand separation
 */
export function formatAmount(n: MaybeNumberlike): string {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;

	return n.toLocaleString('en');
}

/**
 * Format number using an English thousand separation
 */
export function formatMillion(n: MaybeNumber): string {
	if (!isNumber(n)) return notFilledMarker;

	return (n / 1_000_000).toLocaleString('en', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
}

/**
 * Grabs only the domain part from the URL
 */
export function formatUrlAsDomain(url: string): string {
	return new URL(url).hostname;
}

/**
 * Format a datetime string to human readable format.
 *
 * Mostly useful for formattiong ISO-8601 datetime strings coming from the backend.
 */
export function formatDatetime(d: MaybeDate): string {
	if (!d) return '---';

	const s = d.toLocaleString('en-GB', { timeZone: 'UTC' });
	return s + ' UTC';
}

/**
 * Shorten Ethereum address
 */
export function formatShortAddress(address: MaybeString): string {
	if (!address) return notFilledMarker;

	return address.substring(0, 8) + '…';
}

/**
 * Format plain percents.
 *
 * Like average winning profit.
 */
export function formatPercent(n: MaybeNumberlike, minDigits = 1, maxPrecision = minDigits) {
	n = toFloatingPoint(n);
	if (!isNumber(n)) return notFilledMarker;

	const notation = isExtreme(n, VERY_SMALL_PERCENT, VERY_LARGE_PERCENT) ? 'scientific' : 'standard';
	return formatNumber(n, minDigits, maxPrecision, {
		notation,
		style: 'percent'
	});
}

/**
 * Format interest rate value given as percent-form value
 */
export function formatInterestRate(n: MaybeNumber, minDigits = 2, maxPrecision = minDigits) {
	return formatPercent(n / 100, minDigits, maxPrecision);
}

/**
 * Format strategy key metric float numbers like Sharpe and Sortino
 */
export function formatKeyMetricNumber(n: MaybeNumber): string {
	if (!isNumber(n)) return notFilledMarker;
	return n.toLocaleString('en', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

/**
 * Custom percent formatter for pool swap fee (Uniswap V3)
 *
 * Uses `minimumSignificantDigits` instead of `minimumFractionDigits`
 */
export function formatSwapFee(n: MaybeNumber): string {
	if (!isNumber(n)) return '';
	return n.toLocaleString('en', {
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 2,
		style: 'percent'
	});
}

/**
 * Formats the time duration string in format '5 days 10h 15m'
 *
 * Timedelta is received from the API as a duration in seconds.
 */
export function formatDuration(seconds: number): string {
	const days = Math.floor(seconds / DAY);
	seconds %= DAY;
	const hours = Math.floor(seconds / HOUR);
	seconds %= HOUR;
	const minutes = Math.floor(seconds / MINUTE);

	const dayStr = days < 1 ? '' : days === 1 ? '1 day ' : `${days} days `;
	return `${dayStr}${hours}h ${minutes}m`;
}

/**
 * Formats minute and seconds timespans.
 *
 * Used formatting trade execution delays.
 *
 * E.g. 1m 2.34s
 */
export function formatDurationMinutesSeconds(seconds: number): string {
	const minutes = Math.floor(seconds / MINUTE);
	const secondsRemainder = (seconds - minutes * MINUTE).toFixed(2);
	return `${minutes}m ${secondsRemainder}s`;
}

/**
 * Formats the time duration string in day granularity.
 *
 * unixTimestamp is received from API as unix seconds since epoch
 */
export function formatDaysAgo(unixTimestamp: MaybeNumber): string {
	if (!isNumber(unixTimestamp)) return notFilledMarker;
	const seconds = Date.now() / 1000 - unixTimestamp;
	const days = Math.floor(seconds / DAY);
	return days < 1 ? 'Less than a day' : days === 1 ? '1 day' : `${days} days`;
}

/**
 * Formats arbitrary value with fallback string if undefined/null
 */
export function formatValue(value: any): string {
	return value?.toString() ?? notFilledMarker;
}

/**
 * Formats the difference as minutes and seconds.
 *
 * E.g. 1m 2s
 *
 * @param before UNIX timestamp
 * @param after UNIX timestamp
 */
export function formatTimeDiffMinutesSeconds(before: MaybeNumber, after: MaybeNumber): string {
	if (!isNumber(before) || !isNumber(after)) {
		return '---';
	}

	const duration = after - before;

	return formatDurationMinutesSeconds(duration);
}

/**
 * Formats the price difference between expected and executed
 *
 * E.g. +0.30%
 *
 * @param before Dollar value
 * @param after Dollar value
 */
export function formatPriceDifference(before: MaybeNumber, after: MaybeNumber): string {
	if (!isNumber(before) || !isNumber(after)) {
		return '---';
	}

	const diff = ((after - before) / before) * 100;

	const formatted = diff.toLocaleString('en-US', {
		minimumSignificantDigits: 2,
		maximumSignificantDigits: 2
	});

	const sign = diff > 0 ? '+' : '';

	return `${sign}${formatted} %`;
}
