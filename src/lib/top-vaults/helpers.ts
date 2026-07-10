import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
import type { Core3Pol, Core3Protocol, DenominationTokenRate, FeeMode, SlimVaultInfo, VaultInfo } from './schemas';
import { slimVaultKeys } from './schemas';
import { resolve } from '$app/paths';
import { vaultSparklinesUrl } from '$lib/config';
import { capitalize, isNumber } from '$lib/helpers/formatters';
import { slugify } from '$lib/helpers/slugify';

/**
 * Strip a full vault object to only the fields needed for listing/summary views.
 */
export function slimVault(vault: Record<string, unknown>): SlimVaultInfo {
	const slim = {} as Record<string, unknown>;
	for (const key of slimVaultKeys) {
		slim[key] = vault[key as string];
	}
	return slim as SlimVaultInfo;
}

const HYPERCORE_CHAIN_ID = 9999;
const KINEXYS_PROTOCOL_SLUG = 'kinexys';
const KINEXYS_DENOMINATION = 'USD (offchain)';
const KINEXYS_DENOMINATION_SLUG = 'usd-offchain';
export const UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME = 'Unknown vault protocol';
const UNKNOWN_VAULT_PROTOCOL_SLUGS = new Set(['erc-4626']);

/**
 * Kinexys vault balances are denominated in off-chain USD dollars, even when
 * the scanner reports the settlement token address as USDC.
 */
export function normaliseKinexysVaultDenomination(vault: VaultInfo): VaultInfo {
	if (vault.protocol_slug !== KINEXYS_PROTOCOL_SLUG) return vault;

	return {
		...vault,
		denomination: KINEXYS_DENOMINATION,
		normalised_denomination: KINEXYS_DENOMINATION,
		denomination_slug: KINEXYS_DENOMINATION_SLUG,
		denomination_token_address: null,
		denomination_token_rate: null
	};
}

export function normaliseVaultProtocolDisplayName(vault: VaultInfo): VaultInfo {
	const displayName = getProtocolDisplayName(vault.protocol, vault.protocol_slug);
	if (displayName === vault.protocol) return vault;

	return {
		...vault,
		protocol: displayName
	};
}

/** Minimum TVL threshold for vault group breakdown pages */
export const MIN_TVL_THRESHOLD = 10_000;

/** Default TVL threshold - global and per-chain */
export const DEFAULT_TVL_THRESHOLD = 50_000;
/** Maximum TVL value included in listing summary totals. Higher values are treated as broken scanner data. */
export const MAX_SUMMARY_TVL_USD = 1_000_000_000;
// prettier-ignore
const CHAIN_TVL_THRESHOLD_OVERRIDES = new Map([
  [HYPERCORE_CHAIN_ID, 1_000_000]
]);

/** TVL filter option with support for chain-specific overrides */
export interface TvlFilterOption {
	key: string;
	/** Short label shown when dropdown is collapsed */
	label: string;
	/** Full label shown in the dropdown option list */
	optionLabel: string;
	/** Default TVL threshold in USD */
	value: number;
	/** Optional per-chain threshold overrides (chain_id → threshold) */
	chainOverrides?: Record<number, number>;
}

export const tvlFilterOptions: TvlFilterOption[] = [
	{ key: 'any', label: 'Any', optionLabel: 'Any', value: 0 },
	{ key: '10k', label: '$10k', optionLabel: '$10k', value: 10_000 },
	{
		key: '50k-hl',
		label: '$50k*',
		optionLabel: '$50k, and >$1M for Hyperliquid vaults',
		value: 50_000,
		chainOverrides: { [HYPERCORE_CHAIN_ID]: 1_000_000 }
	},
	{ key: '50k', label: '$50k', optionLabel: '$50k', value: 50_000 },
	{ key: '250k', label: '$250k', optionLabel: '$250k', value: 250_000 },
	{ key: '1m', label: '$1M', optionLabel: '$1M', value: 1_000_000 },
	{ key: '2m', label: '$2M', optionLabel: '$2M', value: 2_000_000 },
	{ key: '10m', label: '$10M', optionLabel: '$10M', value: 10_000_000 }
];

export const DEFAULT_TVL_KEY = '50k-hl';

export const ageFilterOptions = [
	{ label: 'Any', value: 0, maxAge: Infinity },
	{ label: 'Younger than 3 months', value: 0, maxAge: 0.25 },
	{ label: 'Younger than 1 year', value: 0, maxAge: 1 },
	{ label: '3 months', value: 0.25, maxAge: Infinity },
	{ label: '6 months', value: 0.5, maxAge: Infinity },
	{ label: '1 year', value: 1, maxAge: Infinity },
	{ label: '2 years', value: 2, maxAge: Infinity }
];

export const riskFilterOptions = [
	{ label: 'Blacklisted', optionLabel: 'Blacklisted or safer', minValue: 0, maxValue: 999 },
	{ label: 'Dangerous', optionLabel: 'Dangerous or safer', minValue: 0, maxValue: 50 },
	{ label: 'Severe', optionLabel: 'Severe or safer', minValue: 0, maxValue: 40 },
	{ label: 'High', optionLabel: 'High or safer', minValue: 0, maxValue: 30 },
	{ label: 'High risk only', optionLabel: 'High risk only', minValue: 30, maxValue: 50 },
	{ label: 'Low', optionLabel: 'Low or safer', minValue: 0, maxValue: 20 },
	{ label: 'Minimal', optionLabel: 'Minimal or safer', minValue: 0, maxValue: 10 },
	{ label: 'Negligible', optionLabel: 'Negligible only', minValue: 0, maxValue: 1 }
];

export interface DdFilterOption {
	key: string;
	label: string;
	optionLabel: string;
	/** Maximum allowed |max_drawdown| as a decimal (e.g., 0.01 = 1%). Infinity = no filter */
	value: number;
}

export interface MonthlyReturnFilterOption {
	key: string;
	label: string;
	optionLabel: string;
	/**
	 * Filter mode:
	 * - 'any': no filter
	 * - 'lt': vault annualised 1M return < threshold
	 * - 'gt': vault annualised 1M return > threshold
	 * - 'gt-treasury': vault annualised 1M return > treasury note rate
	 */
	mode: 'any' | 'lt' | 'gt' | 'gt-treasury';
	/** Threshold as a decimal (e.g. 0.05 = 5%). Ignored for 'any' and 'gt-treasury' modes */
	value: number;
}

export const monthlyReturnFilterOptions: MonthlyReturnFilterOption[] = [
	{ key: 'any', label: 'Any', optionLabel: 'Any', mode: 'any', value: 0 },
	{ key: 'neg', label: '< 0%', optionLabel: '< 0%', mode: 'lt', value: 0 },
	{ key: 'treasury', label: '> US Treasury', optionLabel: '> US Treasury note', mode: 'gt-treasury', value: 0 },
	{ key: '5', label: '> 5%', optionLabel: '> 5%', mode: 'gt', value: 0.05 },
	{ key: '10', label: '> 10%', optionLabel: '> 10%', mode: 'gt', value: 0.1 }
];

/**
 * Get the annualised 1-month return for a vault (net if available, otherwise gross).
 */
export function getMonthlyReturn(vault: Pick<VaultInfo, 'one_month_cagr_net' | 'one_month_cagr'>): number | null {
	return vault.one_month_cagr_net ?? vault.one_month_cagr ?? null;
}

export const ddFilterOptions: DdFilterOption[] = [
	{ key: '0.1', label: '0.1%', optionLabel: '0.1% or less', value: 0.001 },
	{ key: '1', label: '1%', optionLabel: '1% or less', value: 0.01 },
	{ key: '3', label: '3%', optionLabel: '3% or less', value: 0.03 },
	{ key: '5', label: '5%', optionLabel: '5% or less', value: 0.05 },
	{ key: '10', label: '10%', optionLabel: '10% or less', value: 0.1 },
	{ key: '20', label: '20%', optionLabel: '20% or less', value: 0.2 },
	{ key: 'any', label: 'Any', optionLabel: 'Any', value: Infinity }
];

/**
 * Extract lifetime max drawdown from a vault's period_results.
 *
 * @returns a non-positive number (e.g. -0.05 for -5%) or null if unavailable
 */
export function getLifetimeMaxDrawdown(vault: Pick<VaultInfo, 'period_results'>): number | null {
	return vault.period_results?.find((p) => p.period.toLowerCase() === 'lifetime')?.max_drawdown ?? null;
}

/**
 * Resolve path to vault details page for a given vault
 */
export function resolveVaultDetails(vault: Pick<VaultInfo, 'vault_slug'>) {
	return resolve(`/trading-view/vaults/${vault.vault_slug}`);
}

/**
 * Determine if vault is blacklisted.
 */
export function isBlacklisted(vault: Pick<VaultInfo, 'risk_numeric'> & Partial<Pick<VaultInfo, 'risk'>>) {
	return vault.risk_numeric === 999 || vault.risk?.toLowerCase() === 'blacklisted';
}

const unsupportedProtocolNames = ['<protocol not yet identified>', '<unknown erc-7450>'] as const;
const unsupportedProtocolSlugs = new Set(unsupportedProtocolNames.map((protocol) => slugify(protocol)));

export function isUnsupportedProtocolName(protocol: string | null | undefined) {
	const normalisedProtocol = protocol?.trim();
	return !normalisedProtocol || normalisedProtocol.startsWith('<');
}

export function isUnsupportedProtocolSlug(protocolSlug: string | null | undefined) {
	return protocolSlug != null && unsupportedProtocolSlugs.has(protocolSlug);
}

export function hasSupportedProtocol(vault: Pick<VaultInfo, 'protocol'> & Partial<Pick<VaultInfo, 'protocol_slug'>>) {
	return !isUnsupportedProtocolName(vault.protocol) && !isUnsupportedProtocolSlug(vault.protocol_slug);
}

export function isManuallyMappedUnknownProtocolSlug(protocolSlug: string | null | undefined) {
	return protocolSlug != null && UNKNOWN_VAULT_PROTOCOL_SLUGS.has(protocolSlug);
}

const FRONTPAGE_RISK_FILTER = riskFilterOptions.find((option) => option.label === 'Severe');

/**
 * Check if vault is eligible for the frontpage Top DeFi Vaults widget.
 */
export function isEligibleFrontpageVault(
	vault: Pick<VaultInfo, 'protocol' | 'risk_numeric'> & Partial<Pick<VaultInfo, 'protocol_slug' | 'risk'>>
) {
	if (!FRONTPAGE_RISK_FILTER) return false;
	if (!hasSupportedProtocol(vault)) return false;
	if (isBlacklisted(vault)) return false;
	if (vault.risk_numeric == null) return false;

	return vault.risk_numeric >= FRONTPAGE_RISK_FILTER.minValue && vault.risk_numeric <= FRONTPAGE_RISK_FILTER.maxValue;
}

export function getProtocolDisplayName(protocol: string | null | undefined, protocolSlug?: string | null): string {
	if (isManuallyMappedUnknownProtocolSlug(protocolSlug)) return UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME;
	if (protocol == null || isUnsupportedProtocolName(protocol)) return 'Unknown';
	return protocol;
}

/**
 * Get combined Morpho warning flags from vault other_data
 */
export function getMorphoFlags(vault: Pick<VaultInfo, 'other_data'>): string[] {
	const data = vault.other_data;
	if (!data) return [];
	return [...new Set([...data.morpho_vault_flags, ...data.morpho_market_flags])];
}

/**
 * Check if vault has good operational status (deposits and redemptions are both open)
 */
export function isGoodVaultStatus(vault: VaultInfo): boolean {
	return vault.deposit_closed_reason == null && vault.redemption_closed_reason == null;
}

/**
 * Check if vault meets minimum TVL threshold
 */
export function meetsMinTvl(vault: Pick<VaultInfo, 'current_nav'>, threshold = MIN_TVL_THRESHOLD) {
	return (vault.current_nav ?? 0) >= threshold;
}

/**
 * Check if vault meets default TVL thresholds (with custom chain overrides)
 */
export function meetsDefaultTvl(vault: Pick<VaultInfo, 'current_nav' | 'chain_id'>) {
	const threshold = CHAIN_TVL_THRESHOLD_OVERRIDES.get(vault.chain_id) ?? DEFAULT_TVL_THRESHOLD;
	return (vault.current_nav ?? 0) >= threshold;
}

type VaultDenominationFields = Pick<
	VaultInfo,
	'denomination' | 'normalised_denomination' | 'denomination_slug' | 'denomination_token_rate'
>;
type VaultWithRate = Pick<VaultInfo, 'denomination_token_rate'> & Partial<VaultDenominationFields>;
type VaultWithNavAndRate = Pick<VaultInfo, 'current_nav' | 'denomination_token_rate'>;
type VaultWithPeakNavAndRate = Pick<VaultInfo, 'peak_nav' | 'denomination_token_rate'>;

export interface CurrencyUsdRate {
	rate: number;
	fetchedAt: string | null;
}

const nonUsdCurrencyCodes = ['eur', 'gbp', 'jpy', 'cad', 'chf', 'aud', 'try', 'sgd', 'brl', 'mxn', 'zar'] as const;

function inferVaultDenominationCurrency(vault: Partial<VaultDenominationFields>): string | null {
	const candidates = [vault.denomination_slug, vault.denomination, vault.normalised_denomination]
		.map((value) => value?.trim().toLowerCase())
		.filter((value): value is string => Boolean(value));

	if (candidates.some((value) => value.includes('usd'))) return 'usd';

	for (const currency of nonUsdCurrencyCodes) {
		if (
			candidates.some(
				(value) =>
					value === currency ||
					value.startsWith(currency) ||
					value.endsWith(currency) ||
					value.includes(`${currency}-`) ||
					value.includes(`-${currency}`)
			)
		) {
			return currency;
		}
	}

	return null;
}

/**
 * Return the detected denomination currency for a vault, when rate metadata
 * provides one. USD-denominated vaults resolve to `usd`; non-USD pegs resolve
 * to currencies like `eur`, `gbp`, or `jpy`.
 */
export function getVaultDenominationCurrency(vault: VaultWithRate): string | null {
	return (
		vault.denomination_token_rate?.native_rate_currency?.toLowerCase() ??
		vault.denomination_token_rate?.source_currency?.toLowerCase() ??
		inferVaultDenominationCurrency(vault) ??
		null
	);
}

export function getStablecoinMetadataCurrency(metadata: StablecoinMetadata | undefined): string | null {
	const currency = metadata?.peg_rate_currency?.toLowerCase();
	if (!currency || currency === 'usd') return null;
	return currency;
}

function isFinitePositiveNumber(value: number | null | undefined): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function getCurrencyUsdRates(metadataIndex: StablecoinMetadata[]): Map<string, CurrencyUsdRate> {
	const rates = new Map<string, CurrencyUsdRate[]>();

	for (const metadata of metadataIndex) {
		const currency = getStablecoinMetadataCurrency(metadata);
		if (!currency || !isFinitePositiveNumber(metadata.usd_rate) || !isFinitePositiveNumber(metadata.peg_rate)) {
			continue;
		}

		rates.set(currency, [
			...(rates.get(currency) ?? []),
			{
				rate: metadata.usd_rate / metadata.peg_rate,
				fetchedAt: metadata.usd_rate_fetched_at ?? metadata.usd_rate_updated_at ?? null
			}
		]);
	}

	return new Map(
		[...rates.entries()].map(([currency, values]) => {
			const sorted = values.toSorted((a, b) => a.rate - b.rate);
			return [currency, sorted[Math.floor(sorted.length / 2)]];
		})
	);
}

export function buildVaultDenominationTokenRate(
	metadata: StablecoinMetadata | undefined,
	currency: string,
	currencyUsdRates: Map<string, CurrencyUsdRate>
): DenominationTokenRate | null {
	const currencyUsdRate = currencyUsdRates.get(currency);
	const usdRate = metadata?.usd_rate ?? currencyUsdRate?.rate ?? null;
	if (!isFinitePositiveNumber(usdRate)) return null;
	const usdRateFetchedAt =
		metadata?.usd_rate_fetched_at ?? metadata?.usd_rate_updated_at ?? currencyUsdRate?.fetchedAt ?? null;

	return {
		coingecko_id: metadata?.coingecko_id ?? null,
		source_currency: currency,
		usd_rate: usdRate,
		usd_rate_fetched_at: usdRateFetchedAt,
		usd_rate_source: metadata?.usd_rate ? 'stablecoin-metadata' : 'stablecoin-metadata-currency-fallback',
		native_rate: metadata?.peg_rate ?? null,
		native_rate_currency: currency,
		native_rate_fetched_at: metadata?.usd_rate_fetched_at ?? metadata?.usd_rate_updated_at ?? null,
		native_rate_source: metadata?.peg_rate ? 'stablecoin-metadata' : null,
		source_currency_usd_rate: currencyUsdRate?.rate ?? null,
		source_currency_usd_rate_fetched_at: currencyUsdRate?.fetchedAt ?? null,
		source_currency_usd_rate_source: currencyUsdRate ? 'stablecoin-metadata' : null
	};
}

export function withVaultDenominationTokenRate(
	vault: VaultInfo,
	metadata: StablecoinMetadata | undefined,
	currencyUsdRates: Map<string, CurrencyUsdRate>
): VaultInfo {
	if (isFinitePositiveNumber(vault.denomination_token_rate?.usd_rate)) return vault;

	const vaultCurrency = getVaultDenominationCurrency(vault);
	const metadataCurrency = getStablecoinMetadataCurrency(metadata);
	const currency = vaultCurrency ?? metadataCurrency;
	if (!currency || currency === 'usd') return vault;

	const denominationTokenRate = buildVaultDenominationTokenRate(metadata, currency, currencyUsdRates);
	if (!denominationTokenRate) return vault;

	return {
		...vault,
		denomination_token_rate: denominationTokenRate
	};
}

/**
 * Whether the vault denomination is explicitly known to be non-USD.
 *
 * Backend rate metadata is preferred. When the vault feed has no rate metadata,
 * common fiat denomination symbols are inferred conservatively so USD-branded
 * symbols such as USDC, USDT, USDe, FDUSD and USDG stay classified as USD.
 */
export function isNonUsdDenominatedVault(vault: VaultWithRate): boolean {
	const currency = getVaultDenominationCurrency(vault);
	return currency != null && currency !== 'usd';
}

/**
 * Return the vault denomination token USD conversion rate.
 *
 * Missing USD rates default to 1 only for USD-denominated or unknown-currency
 * vaults, because existing vault pages already treat their NAV as USD. Known
 * non-USD vaults return `null` when no exchange rate is available, avoiding an
 * unconverted denomination-token NAV being displayed as dollars.
 */
export function getVaultDenominationUsdRate(vault: VaultWithRate): number | null {
	const rate = vault.denomination_token_rate?.usd_rate;
	if (rate != null && Number.isFinite(rate) && rate > 0) return rate;

	const currency = getVaultDenominationCurrency(vault);
	return currency == null || currency === 'usd' ? 1 : null;
}

export function getVaultDenominationNativeRate(vault: VaultWithRate): number | null {
	const rate = vault.denomination_token_rate;
	if (rate?.native_rate != null && Number.isFinite(rate.native_rate) && rate.native_rate > 0) return rate.native_rate;

	const currency = getVaultDenominationCurrency(vault);
	if (currency === 'usd') return getVaultDenominationUsdRate(vault);

	if (
		rate?.usd_rate != null &&
		Number.isFinite(rate.usd_rate) &&
		rate.usd_rate > 0 &&
		rate.source_currency_usd_rate != null &&
		Number.isFinite(rate.source_currency_usd_rate) &&
		rate.source_currency_usd_rate > 0
	) {
		return rate.usd_rate / rate.source_currency_usd_rate;
	}

	return null;
}

export function getVaultTvlNative(vault: VaultWithRate, nav: number | null): number | null {
	if (nav == null) return null;
	const nativeRate = getVaultDenominationNativeRate(vault);
	return nativeRate == null ? null : nav * nativeRate;
}

/**
 * Current vault TVL converted from denomination token units to USD.
 */
export function getVaultCurrentTvlUsd(vault: VaultWithNavAndRate): number | null {
	if (vault.current_nav == null) return null;
	const usdRate = getVaultDenominationUsdRate(vault);
	return usdRate == null ? null : vault.current_nav * usdRate;
}

/**
 * Peak vault TVL converted from denomination token units to USD.
 */
export function getVaultPeakTvlUsd(vault: VaultWithPeakNavAndRate): number | null {
	if (vault.peak_nav == null) return null;
	const usdRate = getVaultDenominationUsdRate(vault);
	return usdRate == null ? null : vault.peak_nav * usdRate;
}

const DEFAULT_DETAIL_RISK_FILTER = riskFilterOptions[1];

/**
 * Check if vault is included in vault group (protocol/chain/curator/stablecoin)
 * mini charts and headline stats: not blacklisted, meets the minimum TVL,
 * supported protocol and within the default risk filter (unknown risk passes).
 *
 * Matches the default vault listing table filters, so stats derived from this
 * set agree with the table's initial stats row.
 */
export function isEligibleVaultGroupMiniChartVault(vault: VaultInfo) {
	if (isBlacklisted(vault)) return false;
	if (!meetsMinTvl(vault)) return false;
	if (!hasSupportedProtocol(vault)) return false;

	if (vault.risk_numeric == null) return true;
	return (
		vault.risk_numeric >= DEFAULT_DETAIL_RISK_FILTER.minValue &&
		vault.risk_numeric <= DEFAULT_DETAIL_RISK_FILTER.maxValue
	);
}

/**
 * Return the formatted lockup value for a vault (in days, hours, minutes if needed)
 */
export function getFormattedLockup({ lockup: seconds }: VaultInfo): string {
	if (!isNumber(seconds)) return 'Unknown';

	const minutes = Math.floor(seconds / 60);
	const hours = seconds / 3600;
	const days = Math.floor(hours / 24);
	const remainderHours = Math.floor(hours % 24);

	const parts: string[] = [];

	if (days > 0) parts.push(`${days}d`);
	if (remainderHours > 0) parts.push(`${remainderHours}h`);
	if (parts.length === 0 && minutes > 0) parts.push(`${minutes}m`);
	if (parts.length === 0) return 'Instant';

	return parts.join(' ');
}

/**
 * Return a tooltip string describing the vault's deposit acceptance and lockup period.
 */
export function getLockupTooltip({ lockup }: Pick<VaultInfo, 'lockup'>): string {
	if (lockup == null) return 'This vault is unlikely to have any standard lockup mechanism.';
	if (lockup <= 0)
		return 'This vault currently accepts deposits. This vault should allow instant redemptions under normal conditions.';

	const hours = lockup / 3600;
	const days = Math.floor(hours / 24);
	const remainderHours = Math.floor(hours % 24);
	const minutes = Math.floor(lockup / 60);

	const parts: string[] = [];
	if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
	if (remainderHours > 0) parts.push(`${remainderHours} ${remainderHours === 1 ? 'hour' : 'hours'}`);
	if (parts.length === 0 && minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

	return `This vault currently accepts deposits. Deposits have ${parts.join(', ')} lockup.`;
}

/**
 * Return the formatted fee mode for a vault
 */
export function getFormattedFeeMode({ fee_mode }: VaultInfo): string {
	if (fee_mode == null) return 'Unknown';
	return capitalize(fee_mode.replaceAll('_', ' '));
}

/** Human-readable labels and descriptions for each fee mode */
const feeModeDetails: Record<FeeMode, { label: string; description: string }> = {
	internalised_skimming: {
		label: 'Internalised (performance fee taken from closed positions)',
		description: 'Fees are deducted from closed trades; net fees are reflected in the vault PnL and share price'
	},
	internalised_minting: {
		label: 'Internalised minting',
		description: 'Fees are collected by minting additional vault shares to the fee recipient'
	},
	externalised: {
		label: 'Externalised',
		description: 'Fees are charged separately at deposit or redemption'
	},
	feeless: {
		label: 'Feeless',
		description: 'No fees are charged'
	}
};

/**
 * Return a human-readable label for a fee mode value.
 *
 * @param mode - raw fee_mode string (e.g. `internalised_skimming`)
 */
export function getFeeModeLabel(mode: string | null | undefined): string {
	if (mode == null) return 'Unknown';
	return feeModeDetails[mode as FeeMode]?.label ?? capitalize(mode.replaceAll('_', ' '));
}

/**
 * Return a human-readable description for a fee mode value.
 *
 * @param mode - raw fee_mode string (e.g. `internalised_skimming`)
 */
export function getFeeModeDescription(mode: string | null | undefined): string {
	if (mode == null) return '';
	return feeModeDetails[mode as FeeMode]?.description ?? '';
}

/** Maximum APY to include in weighted average calculation (1000% = 10.0)
 *
 * Consider vaults with higher APY sa broken.
 */
const MAX_APY_THRESHOLD = 10;

type TvlWeightedApyVault = Pick<VaultInfo, 'current_nav' | 'one_month_cagr_net' | 'one_month_cagr' | 'risk_numeric'> &
	Partial<Pick<VaultInfo, 'risk'>>;

interface TvlWeightedApyOptions {
	includeBlacklisted?: boolean;
	maxTvlUsd?: number;
}

/**
 * Calculate TVL-weighted average APY for an array of vaults.
 * Uses net returns when available, falls back to gross returns.
 * Excludes blacklisted vaults by default and vaults with APY > 1000%.
 */
export function calculateTvlWeightedApy(
	vaults: TvlWeightedApyVault[],
	options: TvlWeightedApyOptions = {}
): number | null {
	let weightedSum = 0;
	let tvlSum = 0;

	for (const vault of vaults) {
		if (!options.includeBlacklisted && isBlacklisted(vault)) continue;

		const tvl = vault.current_nav ?? 0;
		const apy = vault.one_month_cagr_net ?? vault.one_month_cagr;

		if (options.maxTvlUsd != null && tvl > options.maxTvlUsd) continue;

		if (Number.isFinite(tvl) && tvl > 0 && apy != null && apy <= MAX_APY_THRESHOLD) {
			weightedSum += tvl * apy;
			tvlSum += tvl;
		}
	}

	return tvlSum > 0 ? weightedSum / tvlSum : null;
}

/**
 * Calculate total TVL for an array of vaults
 */
export function calculateTotalTvl(
	vaults: Pick<VaultInfo, 'current_nav'>[],
	options: { maxTvlUsd?: number } = {}
): number {
	return vaults.reduce((sum, v) => {
		const tvl = v.current_nav ?? 0;
		if (!Number.isFinite(tvl)) return sum;
		if (options.maxTvlUsd != null && tvl > options.maxTvlUsd) return sum;
		return sum + tvl;
	}, 0);
}

/**
 * Compare two vaults by one or more numeric columns. Used with vaults.sort or .toSorted.
 *
 * @param keys - array of numeric VaultInfo properties
 * @maram defaultValue - fallback for null/undefined values (-Infinity to sort lowest, Infinity to sort highest)
 */
export function rankVaultsBy<V extends Record<string, unknown>>(keys: (keyof V)[], defaultValue = -Infinity) {
	return (a: V, b: V) => {
		for (const key of keys) {
			const aVal = a[key] as number | null;
			const bVal = b[key] as number | null;
			if (aVal === bVal) continue;
			return (aVal ?? defaultValue) - (bVal ?? defaultValue);
		}
		return 0;
	};
}

/** UTM query string appended to all outbound CORE3 links so CORE3 can attribute referral traffic. */
const CORE3_UTM = 'utm_source=tradingstrategy';

/** CORE3 project methodology page, tagged with the partner integration UTM params. */
export const CORE3_METHODOLOGY_URL =
	'https://core3.io/methodology/projects?utm_source=tradingstrategy&utm_medium=partner&utm_campaign=integration';

/**
 * Resolve the public CORE3 project profile URL for a rated protocol, e.g.
 * `https://core3.io/projects/sky?utm_source=tradingstrategy`.
 *
 * Built from the CORE3 `slug` rather than the upstream `link` field, which is
 * malformed (it concatenates the slug directly onto the origin without the
 * `/projects/` path, e.g. `https://core3.ioinverse-finance`). Returns
 * `undefined` when the slug is missing.
 */
export function getCore3ReportUrl(core3: Pick<Core3Protocol, 'slug'>): string | undefined {
	if (!core3.slug) return undefined;
	return `https://core3.io/projects/${core3.slug}?${CORE3_UTM}`;
}

/** Qualitative tone for a CORE3 letter grade, used for colour-coding. */
export type Core3RatingTone = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

/**
 * Map a CORE3 letter grade to a qualitative tone for colour-coding.
 * Scale, best to worst: AAA, AA, A, BBB, BB, B, CCC, CC, C, DDD, DD, D.
 */
export function getCore3RatingTone(rating: string | null | undefined): Core3RatingTone {
	const r = rating?.toUpperCase() ?? '';
	if (r.startsWith('A')) return 'excellent';
	if (r.startsWith('B')) return 'good';
	if (r.startsWith('C')) return 'fair';
	if (r.startsWith('D')) return 'poor';
	return 'unknown';
}

/**
 * Map a CORE3 risk sub-score (0–100, lower is better) to the same qualitative
 * tone used for letter grades, so per-category meters share the grade colours.
 */
export function getCore3ScoreTone(score: number | null | undefined): Core3RatingTone {
	if (score == null) return 'unknown';
	if (score < 30) return 'excellent';
	if (score < 50) return 'good';
	if (score < 70) return 'fair';
	return 'poor';
}

/**
 * CORE3 risk categories in scorecard display order, each with its methodology
 * weight (the category's share of the aggregate Probability of Loss score).
 * Single source of truth for the scorecard and the methodology tooltip — the
 * tooltip derives its own weight-descending ordering from this list.
 */
export const CORE3_CATEGORIES = [
	{ key: 'security', label: 'Security', weight: 35 },
	{ key: 'financial', label: 'Financial', weight: 15 },
	{ key: 'operational', label: 'Operational', weight: 20 },
	{ key: 'reputational', label: 'Reputational', weight: 10 },
	{ key: 'regulatory', label: 'Regulatory', weight: 5 }
] as const;

export type Core3CategoryKey = (typeof CORE3_CATEGORIES)[number]['key'];

/** A single resolved CORE3 category score for display. */
export type Core3CategoryScore = {
	key: Core3CategoryKey;
	label: string;
	/** Risk sub-score, 0–100 (lower is better) */
	score: number;
	/** Qualitative tone for colour-coding the score meter */
	tone: Core3RatingTone;
};

/**
 * Flatten a protocol's `pol_categories` into an ordered, display-ready list,
 * dropping categories with no score. Returns an empty array when the protocol
 * has no per-category breakdown (e.g. the compact per-vault CORE3 fallback).
 */
export function getCore3CategoryScores(core3: Pick<Core3Protocol, 'pol_categories'>): Core3CategoryScore[] {
	const categories = core3.pol_categories;
	if (!categories) return [];

	return CORE3_CATEGORIES.flatMap(({ key, label }) => {
		const score = categories[key];
		if (score == null) return [];
		return [{ key, label, score, tone: getCore3ScoreTone(score) }];
	});
}

/**
 * Resolve the CORE3 ranking (leaderboard) URL that a protocol's CORE3 rank
 * refers to. CORE3 splits its ranking into projects and exchanges, so we pick
 * the list matching the protocol's CORE3 category.
 */
export function getCore3RankingUrl(core3: Pick<Core3Protocol, 'category'>): string {
	const isExchange = /exchange/i.test(core3.category?.name ?? '');
	return `https://core3.io/ratings/${isExchange ? 'exchanges' : 'projects'}?${CORE3_UTM}`;
}

/**
 * Resolve the headline CORE3 rating fields for a vault.
 *
 * Prefer the full protocol record because it contains the canonical CORE3 slug
 * and contextual metadata. Fall back to the compact per-vault `core3` block
 * emitted by newer vault data exports.
 */
export function getCore3PolForVault(
	vault: Pick<VaultInfo, 'core3' | 'protocol_slug'>,
	core3Protocols: Record<string, Core3Protocol>
): Core3Pol | null {
	const protocolPol = core3Protocols[vault.protocol_slug]?.pol;
	if (protocolPol) return protocolPol;

	const vaultCore3 = vault.core3;
	if (!vaultCore3) return null;

	const hasRating = vaultCore3.risk_rating_label != null;
	const hasScore = vaultCore3.risk_score != null;
	const hasConfidence = vaultCore3.confidence != null;
	if (!hasRating && !hasScore && !hasConfidence) return null;

	return {
		score: vaultCore3.risk_score ?? null,
		rating: vaultCore3.risk_rating_label ?? null,
		confidence: vaultCore3.confidence ?? null
	};
}

/**
 * Resolve a full-enough CORE3 protocol record for display components.
 *
 * If the top-level `core3_protocols` map has the protocol, return it. Otherwise
 * adapt the compact per-vault CORE3 summary into the subset used by the UI.
 */
export function getCore3ProtocolForVault(
	vault: Pick<VaultInfo, 'core3' | 'protocol' | 'protocol_slug'>,
	core3Protocols: Record<string, Core3Protocol>
): Core3Protocol | null {
	const protocolRecord = core3Protocols[vault.protocol_slug];
	if (protocolRecord?.pol) return protocolRecord;

	const pol = getCore3PolForVault(vault, core3Protocols);
	if (!pol) return null;

	return {
		slug: '',
		name: getProtocolDisplayName(vault.protocol, vault.protocol_slug),
		rank: vault.core3?.core3_ranking ?? null,
		pol,
		data_coverage: { percentage: vault.core3?.data_coverage ?? null },
		market_cap:
			vault.core3?.market_cap != null
				? {
						in_usd: String(vault.core3.market_cap)
					}
				: undefined
	};
}

/**
 * Get URL for vault price chart sparkline
 */
export function getVaultSparklineUrl(vault: Pick<VaultInfo, 'id'>, type: 'svg' | 'png' = 'svg') {
	if (vaultSparklinesUrl) {
		return `${vaultSparklinesUrl}/sparkline-90d-${vault.id}.${type}`;
	}
}
