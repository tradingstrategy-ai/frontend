import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
import { formatReserveUSD, type FormatReserveUSDResponse, type ReserveDataWithPrice } from '@aave/math-utils';
import { isNumber } from '$lib/helpers/formatters';

/**
 * Return internal URL for a lending reserve
 */
export function lendingReserveInternalUrl({ chain_slug, protocol_slug, reserve_slug }: LendingReserve) {
	return `/trading-view/${chain_slug}/lending/${protocol_slug}/${reserve_slug}`;
}

/**
 * Return external URL for a lending reserve (on reserve protocol's web site)
 */
export function lendingReserveExternalUrl({ chain_slug, protocol_slug, asset_address }: LendingReserve) {
	// only Aave V2 and V3 are currently supported
	if (!/aave_v[23]/.test(protocol_slug)) return undefined;

	const marketSlug = chain_slug === 'ethereum' ? 'mainnet' : chain_slug;
	const versionSuffix = protocol_slug === 'aave_v3' ? '_v3' : '';

	const params = new URLSearchParams({
		underlyingAsset: asset_address,
		marketName: `proto_${marketSlug}${versionSuffix}`
	});
	return `https://app.aave.com/reserve-overview/?${params}`;
}

/**
 * Determine if reserve is borrowable based on non-zero Variable Borrow APR
 */
export function isBorrowable({ additional_details }: LendingReserve) {
	return additional_details.variable_borrow_apr_latest > 0;
}

/**
 * Use Aave Utilities to format and convert (USD) raw Aave reserve data
 *
 * See: docs/aave-utilities.md
 */
export function getFormattedReserveUSD({ additional_details }: LendingReserve) {
	if (!additional_details) return;
	const { aggregated_reserve_data: reserveData, base_currency_info: baseCurrency } = additional_details;
	if (!(reserveData && baseCurrency)) return;

	// These properties need to be converted from strings to numbers
	// See: https://github.com/aave/aave-utilities/blob/master/packages/math-utils/src/formatters/reserve/index.ts#L52-L85
	const numberProps = [
		'decimals',
		'stableDebtLastUpdateTimestamp',
		'lastUpdateTimestamp',
		'eModeCategoryId',
		'debtCeilingDecimals',
		'eModeLtv',
		'eModeLiquidationThreshold',
		'eModeLiquidationBonus'
	];

	numberProps.forEach((key) => (reserveData[key] &&= Number(reserveData[key])));

	const marketReferencePriceInUsd = baseCurrency.marketReferenceCurrencyPriceInUsd.toString();
	// convert currency unit to number of decimals – e.g., 100_000_000 -> 8
	const marketReferenceCurrencyDecimals = Math.log10(baseCurrency.marketReferenceCurrencyUnit);

	return formatReserveUSD({
		// the API delivers the Aave reserve payload with numeric fields as strings; the
		// conversion above makes it match the aave-utilities shape
		reserve: reserveData as unknown as ReserveDataWithPrice,
		currentTimestamp: Date.now() / 1000,
		marketReferencePriceInUsd,
		marketReferenceCurrencyDecimals
		// formatReserveUSD spreads the input, so the pool data provider's `borrowingEnabled` flag
		// (not part of the aave-utilities ReserveData type) is on the result at runtime
	}) as FormatReserveUSDResponse & { borrowingEnabled?: boolean };
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
	if (isNumber(seconds) && seconds < 0) {
		throw new RangeError('seconds must be >= 0');
	} else if (isNumber(apr) && isNumber(seconds)) {
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
	if (isNumber(principal) && principal < 0) {
		throw new RangeError('principal must be >= 0');
	} else if (isNumber(principal) && isNumber(apr) && isNumber(seconds)) {
		const periodYield = yieldForPeriod(apr, seconds);
		return periodYield && principal * periodYield;
	}
}
