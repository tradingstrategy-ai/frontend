import { formatDistanceToNow } from 'date-fns';

type MaybeType<Type> = Type | null | undefined;
type MaybeNumber = MaybeType<number>;
type MaybeDate = MaybeType<Date>;
type MaybeString = MaybeType<string>;

export const notFilledMarker = '---';

/**
 * Convert number to thousands.
 *
 * No suffix added.
 */
export function formatKilos(n: number): string {
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
export function formatSizeMegabytes(n: number): string {
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
export function formatSizeGigabytes(n: number): string {
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

export function formatPriceChange(n: MaybeNumber): string {
	if (!Number.isFinite(n)) return notFilledMarker;
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
 * Format a UNIX timestamp as human readable date.
 *
 * @param d Seconds since epoch
 */
export function formatUnixTimestamp(d: MaybeNumber): string {
	if (!Number.isFinite(d)) return notFilledMarker;

	return formatDatetime(new Date(d * 1000));
}

/**
 * Format a USDC balance as it comes out from the contract.
 */
export function formatUSDCBalance(web3, b: string, decimals: number): string {
	const n = parseFloat(b);
	const val = n / Math.pow(10, decimals);
	return val.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Shorten Ethereum address
 */
export function formatShortAddress(address: MaybeString): string {
	if (!address) return notFilledMarker;

	return address.substring(0, 8) + '…';
}

/**
 * Format since
 *
 * @param ts Unix timestamp
 */
export function formatSince(ts: MaybeNumber): string {
	if (!Number.isFinite(ts)) return notFilledMarker;

	return formatDistanceToNow(ts * 1000, { addSuffix: true });
}
