import type { LendingReserve } from '$lib/explorer/lending-reserve-client';

/**
 * Return URL for a lending reserve on a given chain and lending protocol
 */
export function lendingReserveUrl(chain: string, protocol: string, underlyingAsset: Address) {
	// only Aave V3 is currently supported
	if (protocol !== 'aave_v3') return undefined;

	const marketSlug = chain === 'ethereum' ? 'mainnet' : chain;
	const params = new URLSearchParams({
		underlyingAsset,
		marketName: `proto_${marketSlug}_v3`
	});
	return `https://app.aave.com/reserve-overview/?${params}`;
}

/**
 * Determine if reserve is borrowable.
 * Current: inferred from non-zero Variable Borrow APR
 * Future: may have a flag on API entity based on smart-contract value
 */
export function isBorrowable({ additional_details }: LendingReserve) {
	return additional_details.variable_borrow_apr_latest > 0;
}

/***
 * Interest rate helpers
 *
 * see: https://docs.aave.com/developers/v/2.0/guides/apy-and-apr#conversions
 *
 * NOTE: The formulas below assume interest compounding every second. If a new
 * lending protocol is introduced with a different compounding interval, they
 * should be updated accoringly.
 */

export const SECONDS_PER_DAY = 60 * 60 * 24;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

/**
 * Calculate yield for a specified rate and period
 */
export function yieldForPeriod(apr: MaybeNumber, seconds: MaybeNumber) {
	if (seconds < 0) {
		throw new RangeError('seconds must be >= 0');
	} else if (Number.isFinite(apr) && Number.isFinite(seconds)) {
		return (1 + apr / SECONDS_PER_YEAR) ** seconds - 1;
	}
}

/**
 * Convert APR to APY
 */
export function aprToApy(apr: MaybeNumber) {
	if (Number.isFinite(apr)) {
		return yieldForPeriod(apr, SECONDS_PER_YEAR);
	}
}

/**
 * Calculate compound interest for a given principal, interest rate and period
 */
export function compoundInterest(principal: MaybeNumber, apr: MaybeNumber, seconds: MaybeNumber) {
	if (principal < 0) {
		throw new RangeError('principal must be >= 0');
	} else if ([principal, apr, seconds].every(Number.isFinite)) {
		const periodYield = yieldForPeriod(apr, seconds);
		return periodYield && principal * periodYield;
	}
}
