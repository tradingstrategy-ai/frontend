import type { FeeMode, SlimVaultInfo, VaultInfo } from './schemas';
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

/** Minimum TVL threshold for vault group breakdown pages */
export const MIN_TVL_THRESHOLD = 10_000;

/** Default TVL threshold - global and per-chain */
export const DEFAULT_TVL_THRESHOLD = 50_000;
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
 * Determine if vault is blacklisted
 */
export function isBlacklisted(vault: Pick<VaultInfo, 'risk_numeric'>) {
	return vault.risk_numeric === 999;
}

const unsupportedProtocolNames = ['<protocol not yet identified>', '<unknown erc-7450>'] as const;
const unsupportedProtocolSlugs = new Set(unsupportedProtocolNames.map((protocol) => slugify(protocol)));

export function isUnsupportedProtocolName(protocol: string | null | undefined) {
	return protocol == null || protocol.trim().startsWith('<');
}

export function isUnsupportedProtocolSlug(protocolSlug: string | null | undefined) {
	return protocolSlug != null && unsupportedProtocolSlugs.has(protocolSlug);
}

export function hasSupportedProtocol(vault: Pick<VaultInfo, 'protocol'> & Partial<Pick<VaultInfo, 'protocol_slug'>>) {
	return !isUnsupportedProtocolName(vault.protocol) && !isUnsupportedProtocolSlug(vault.protocol_slug);
}

export function getProtocolDisplayName(protocol: string | null | undefined): string {
	if (protocol == null || isUnsupportedProtocolName(protocol)) return 'Unknown';
	return protocol;
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
export function getLockupTooltip({ lockup }: Pick<VaultInfo, 'lockup'>, illiquid = false): string {
	if (lockup == null) return 'This vault is unlikely to have any standard lockup mechanism.';
	if (lockup <= 0)
		return illiquid
			? 'This vault currently accepts deposits.'
			: 'This vault currently accepts deposits. This vault should allow instant redemptions under normal conditions.';

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

/**
 * Calculate TVL-weighted average APY for an array of vaults.
 * Uses net returns when available, falls back to gross returns.
 * Excludes blacklisted vaults and vaults with APY > 1000%.
 */
export function calculateTvlWeightedApy(vaults: SlimVaultInfo[]): number | null {
	let weightedSum = 0;
	let tvlSum = 0;

	for (const vault of vaults) {
		if (isBlacklisted(vault)) continue;

		const tvl = vault.current_nav ?? 0;
		const apy = vault.one_month_cagr_net ?? vault.one_month_cagr;

		if (tvl > 0 && apy != null && apy <= MAX_APY_THRESHOLD) {
			weightedSum += tvl * apy;
			tvlSum += tvl;
		}
	}

	return tvlSum > 0 ? weightedSum / tvlSum : null;
}

/**
 * Calculate total TVL for an array of vaults
 */
export function calculateTotalTvl(vaults: Pick<VaultInfo, 'current_nav'>[]): number {
	return vaults.reduce((sum, v) => sum + (v.current_nav ?? 0), 0);
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

/**
 * Get URL for vault price chart sparkline
 */
export function getVaultSparklineUrl(vault: Pick<VaultInfo, 'id'>, type: 'svg' | 'png' = 'svg') {
	if (vaultSparklinesUrl) {
		return `${vaultSparklinesUrl}/sparkline-90d-${vault.id}.${type}`;
	}
}
