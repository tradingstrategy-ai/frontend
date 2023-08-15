export const notFilledMarker = '---';

// number of seconds per minute/hour/day; used duration formatters
const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/**
 * Convert number to thousands.
 *
 * No suffix added.
 */
export function formatKilos(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;

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
	if (!Number.isFinite(n)) return notFilledMarker;

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
	if (!Number.isFinite(n)) return notFilledMarker;

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
 * Try to format everything gracefully.
 */
export function formatDollar(n: MaybeNumber, minFrag = 2, maxFrag = 2, prefix = '$'): string {
	// Plz avoid ending here
	if (!Number.isFinite(n)) return notFilledMarker;

	if (n === 0) {
		return `${prefix}0`;
	}

	const absN = Math.abs(n);

	if (absN < 0.000001) {
		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: 10,
				maximumFractionDigits: 10
			})
		);
	} else if (absN < 0.0001) {
		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: 7,
				maximumFractionDigits: 7
			})
		);
	} else if (absN < 0.01) {
		// Format funny tokens
		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: 5,
				maximumFractionDigits: 5
			})
		);
	}

	if (absN >= 1000 * 1000 * 1000) {
		return (
			prefix +
			(n / (1000 * 1000 * 1000)).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'B'
		);
	} else if (absN >= 1000 * 1000) {
		return (
			prefix +
			(n / (1000 * 1000)).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'M'
		);
	} else if (absN >= 1000) {
		return (
			prefix +
			(n / 1000).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'k'
		);
	} else {

    // Make sure we do not exception out
    // when requesting more accuracy for US dollar prices
    if(maxFrag < minFrag) {
      maxFrag = minFrag;
    }

		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			})
		);
	}
}

/**
 * Format a number with appropriate number of digits based on its magnitude.
 * - larger numbers display `minDigits` after the decimal point
 * - smaller numbers display from `minDigits` up to `maxDigits`
 *   significant digits (to retain precision)
 *
 * @example
 * With min and maxDigits = 2 (the default):
 *    12      -> 12.00
 *     1.234  ->  1.23
 *     0.1    ->  0.10
 *     0.123  ->  0.12
 *     0.0123 ->  0.012
 *
 * @param n - number to format
 * @param minDigits - minimum number of digits to display (default = 2)
 * @param maxDigits - maximum number of significant digits (default = minDigits)
 * @param options - additional options to pass through to `toLocaleString()`
 */
export function formatNumber(n: MaybeNumber, minDigits = 2, maxDigits = minDigits, options = {}) {
	if (minDigits < 1) throw new RangeError('minDigits must be >= 1');
	if (maxDigits < minDigits) throw new RangeError('maxDigits must be >= minDigits');

	if (!Number.isFinite(n)) return notFilledMarker;

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

	const v2 = n.toLocaleString('en-US', {
		minimumSignificantDigits: minDigits,
		maximumSignificantDigits: maxDigits,
		...options
	});

	// return the formatted value with greatest precision
	return v2.length > v1.length ? v2 : v1;
}

/**
 * Format price with '$' prefix, thousands separator, and useful
 * number of digits.
 */
export function formatPrice(n: MaybeNumber, minDigits = 2, maxDigits = 4) {
	maxDigits = Math.max(minDigits, maxDigits);
	return formatNumber(n, minDigits, maxDigits, {
		style: 'currency',
		currency: 'USD'
	});
}

export function formatPriceChange(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;
	return `${n > 0 ? '▲' : '▼'} ${formatPercent(Math.abs(n))}`;
}

/**
 * Format number using an English thousand separation
 */
export function formatAmount(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;

	return n.toLocaleString('en');
}

/**
 * Format number using an English thousand separation
 */
export function formatMillion(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;

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
export function formatPercent(n: MaybeNumber, minDigits = 1, maxDigits = minDigits) {
	return formatNumber(n, minDigits, maxDigits, {
		style: 'percent'
	});
}

/**
 * Format interest rate value given as percent-form value
 */
export function formatInterestRate(n: MaybeNumber, minDigits = 2, maxDigits = minDigits) {
	return formatPercent(n / 100, minDigits, maxDigits);
}

/**
 * Format strategy key metric float numbers like Sharpe and Sortino
 */
export function formatKeyMetricNumber(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;
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
	if (!Number.isFinite(n)) return '';
	return n.toLocaleString('en', {
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 1,
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
 * Formats the time duration string in day granularity.
 *
 * unixTimestamp is received from API as unix seconds since epoch
 */
export function formatDaysAgo(unixTimestamp: number): string {
	if (!Number.isFinite(unixTimestamp)) return notFilledMarker;
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
