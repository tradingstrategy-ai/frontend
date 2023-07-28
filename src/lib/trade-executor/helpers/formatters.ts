/**
 * Number and time formatting helpers.
 */

// https://github.com/fram-x/assert-ts/issues/23
import { PROFITABILITY_THRESHOLD } from './profit';

type MaybeNumber = number | null | undefined;
const notFilledMarker = '---';

export function formatKilos(n): string {
	if (n <= 1000) {
		return (n / 1000).toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
	} else {
		return (n / 1000).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
	}
}

/**
 * Format size in megabytes
 *
 * @param n
 */
export function formatSizeMegabytes(n): string {
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
 *
 * @param n
 */
export function formatSizeGigabytes(n): string {
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
 * Format dataset download key and adds API link as a parameter
 *
 * @param validApiKey
 * @param key
 * @param link
 */
export function formatDownloadLink(validApiKey, key, link) {
	if (!validApiKey) {
		return 'javascript:';
	}

	const url = new URL(link);
	url.searchParams.set('api-key', key);
	return url.toString();
}

/**
 * Format large money amounts in human friendly manner.
 *
 * Crypto prices can vary highly between $1B to $0.00000001.
 * Try to format everything gracefully.
 */
export function formatDollar(n: number | string | undefined, minFrag = 2, maxFrag = 2, prefix = '$'): string {
	// Server-side decimals as strings
	if (typeof n === 'string') n = parseFloat(n);

	// Plz avoid ending here
	if (!Number.isFinite(n)) return notFilledMarker;

	if (n === 0) return `${prefix}0`;

	if (n < 0.000001) {
		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: 10,
				maximumFractionDigits: 10
			})
		);
	} else if (n < 0.0001) {
		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: 7,
				maximumFractionDigits: 7
			})
		);
	} else if (n < 0.01) {
		// Format funny tokens
		return (
			prefix +
			n.toLocaleString('en', {
				minimumFractionDigits: 5,
				maximumFractionDigits: 5
			})
		);
	}

	if (n >= 1000 * 1000 * 1000) {
		return (
			prefix +
			(n / (1000 * 1000 * 1000)).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'B'
		);
	} else if (n >= 1000 * 1000) {
		return (
			prefix +
			(n / (1000 * 1000)).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'M'
		);
	} else if (n >= 1000) {
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
 * Format extreme large or small amounts human friendly manner.
 *
 * Useful to display token amounts.
 *
 * @param n
 * @param minFrag
 * @param maxFrag
 */
export function formatTokenAmount(x: MaybeNumber | string, minFrag = 2, maxFrag = 2, prefix = ''): string {
	// Token quantities come from the API as strings,
	// because JavaScript float 64 bit cannot present quantities accurately.
	// Because we are presenting this number to the user,
	// the accuracy can be lost here.
	if (typeof x == 'string') {
		x = parseFloat(x);
	}

	// Plz avoid ending here
	if (!Number.isFinite(x)) return notFilledMarker;

	// Consider negative quantities
	const n = Math.abs(x);

	if (n === 0) {
		return `${prefix}0`;
	}

	if (n < 0.000001) {
		return (
			prefix +
			x.toLocaleString('en', {
				minimumFractionDigits: 10,
				maximumFractionDigits: 10
			})
		);
	} else if (n < 0.0001) {
		return (
			prefix +
			x.toLocaleString('en', {
				minimumFractionDigits: 7,
				maximumFractionDigits: 7
			})
		);
	} else if (n < 1) {
		// Format funny tokens
		const res =
			prefix +
			x.toLocaleString('en', {
				maximumFractionDigits: 5
			});
		return res;
	}

	if (n >= 1000 * 1000 * 1000) {
		return (
			prefix +
			(x / (1000 * 1000 * 1000)).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'B'
		);
	} else if (n >= 1000 * 1000) {
		return (
			prefix +
			(x / (1000 * 1000)).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'M'
		);
	} else if (n >= 1000) {
		return (
			prefix +
			(x / 1000).toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			}) +
			'k'
		);
	} else {
		return (
			prefix +
			x.toLocaleString('en', {
				minimumFractionDigits: minFrag,
				maximumFractionDigits: maxFrag
			})
		);
	}
}

export function formatPriceChange(n: number): string {
	return (
		(n > 0 ? '▲' : '▼') +
		(Math.abs(n) * 100).toLocaleString('en', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}) +
		'%'
	);
}

/**
 * Format number using an English thousand separation
 * @param n
 */
export function formatAmount(n: number): string {
	if (!n) {
		return notFilledMarker;
	}

	return n.toLocaleString('en');
}

/**
 * Parses an ISO 8601 date format string and assumes UTC timezone.
 *
 * @param ts UNIX timestamp in seconds
 */
export function parseUTCTime(s: string): number {
	// This SHIT is called Javascript
	// https://stackoverflow.com/a/37750412/315168
	const d = new Date(s);
	const utc = d.getTime() - d.getTimezoneOffset() * 60000;
	return utc / 1000;
}

/**
 * Format UNIX timestamp
 * @param ts Timestamp in seconds
 */
export function formatUnixTimestamp(ts: number): string {
	if (!ts) {
		return notFilledMarker;
	}

	const d = new Date(ts * 1000);
	return d.toUTCString();
}

/**
 * Format UNIX timestamp
 * @param ts Timestamp in seconds
 */
export function formatUnixTimestampAsMonth(ts: number): string {
	if (!ts) {
		return notFilledMarker;
	}

	const d = new Date(ts * 1000);
	// https://stackoverflow.com/a/67699283/315168
	return d.toLocaleString('en-us', { month: 'short', year: 'numeric' });
}

/**
 * Format UNIX timestamp
 * @param ts Timestamp in seconds
 */
export function formatUnixTimestampAsDate(ts: number): string {
	if (!ts) {
		return '---';
	}

	const d = new Date(ts * 1000);
	return d.toDateString();
}

/**
 * Format UNIX timestamp as hours:minutes
 * @param ts Timestamp in seconds
 */
export function formatUnixTimestampAsHours(ts: number, newlined = false, seconds = false): string {
	if (!ts) {
		return notFilledMarker;
	}

	const d = new Date(ts * 1000);
	const day = d.toLocaleDateString('en-us', { day: '2-digit' });
	const month = d.toLocaleDateString('en-us', { month: '2-digit' });
	const year = d.toLocaleDateString('en-us', { year: 'numeric' });
	let time;
	if (seconds) {
		time = d.toLocaleTimeString('en-us', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			second: '2-digit'
		});
	} else {
		time = d.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit', hour12: false });
	}

	if (newlined) {
		return `${year}-${month}-${day}<br>${time}`;
	} else {
		return `${year}-${month}-${day} ${time}`;
	}
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
 *
 */
export function formatDatetime(d: Date): string {
	if (!d) {
		return notFilledMarker;
	}

	const s = d.toLocaleString('en-GB', { timeZone: 'UTC' });
	return s + ' UTC';
}

/**
 * Format a USDC balance as it comes out from the contract.
 *
 *
 */
export function formatUSDCBalance(web3, b: string, decimals: number): string {
	const n = parseFloat(b);
	const val = n / Math.pow(10, decimals);
	return val.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format how much profit a position has made.
 * @param n
 */
export function formatProfitability(n: number): string {
	if (n === undefined || n === null) {
		return notFilledMarker;
	}

	let symbol;
	if (Math.abs(n) < PROFITABILITY_THRESHOLD) {
		symbol = '▪️ ';
	} else if (n > 0) {
		symbol = '▲ ';
	} else {
		symbol = '▼ ';
	}

	return (
		symbol +
		(Math.abs(n) * 100).toLocaleString('en', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}) +
		'%'
	);
}

/**
 * Formats the time duration string as
 *
 * @param seconds
 */
export function formatDuration(seconds): string {
	const total = seconds * 1000;

	//const seconds = Math.floor((total / 1000) % 60);
	const minutes = Math.floor((total / 1000 / 60) % 60);
	const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
	const days = Math.floor(total / (1000 * 60 * 60 * 24));

	if (days > 0) {
		return `${days} days ${hours}h ${minutes}m`;
	} else {
		return `${hours}h ${minutes}m`;
	}
}

/**
 * Format basis points (BPS)
 *
 * No unit suffix added.
 *
 * @param n
 */
export function formatBPS(n: number): string {
	if (!n) {
		return notFilledMarker;
	}

	return (Math.abs(n) * 10000).toLocaleString('en', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
}
