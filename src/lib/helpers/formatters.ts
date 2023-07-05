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
 * Format price with '$' prefix, thousands separator, and useful
 * number of fraction digits.
 */
export function formatPrice(n: MaybeNumber, digits: MaybeNumber = undefined) {
	if (!Number.isFinite(n)) return notFilledMarker;

	if (digits === undefined) {
		digits = n < 10 ? 4 : 2;
	}

	return n.toLocaleString('en', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
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
 * Format number using an English thousand separation
 */
export function formatMillion2(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;

	return (n / 1_000_000).toLocaleString('en', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
}

/**
 * Grabs only the domain part from the URL
 */
export function formatUrlAsDomain(u: string): string {
	const url = new URL(u);
	return url.hostname;
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
export function formatPercent(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;

	// Negative zero hot fix
	// Don't format -0 %
	// https://stackoverflow.com/a/7223395/315168
	if(Object.is(-0, n)) {
		n = 0;
	}

	return n.toLocaleString('en', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
		style: 'percent'
	});
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
