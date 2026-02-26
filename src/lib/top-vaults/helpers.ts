import type { VaultInfo } from './schemas';
import { feeMode } from './schemas';
import { resolve } from '$app/paths';
import { capitalize, isNumber } from '$lib/helpers/formatters';
import type { z } from 'zod';

type FeeMode = z.infer<typeof feeMode>;

/** Minimum TVL threshold for vault group breakdown pages */
export const MIN_TVL_THRESHOLD = 10_000;

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

const HYPERCORE_CHAIN_ID = 9999;

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

/**
 * Resolve path to vault details page for a given vault
 */
export function resolveVaultDetails(vault: VaultInfo) {
	return resolve(`/trading-view/vaults/${vault.vault_slug}`);
}

/**
 * Determine if vault is blacklisted
 */
export function isBlacklisted(vault: VaultInfo) {
	return vault.risk_numeric === 999;
}

export function hasSupportedProtocol(vault: VaultInfo) {
	return !vault.protocol.startsWith('<');
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
export function meetsMinTvl(vault: VaultInfo, threshold = MIN_TVL_THRESHOLD) {
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

	function addUnit(unit: string, duration: number) {
		parts.push(`${duration} ${unit}${duration === 1 ? '' : 's'}`);
	}

	if (days > 0) addUnit('day', days);
	if (remainderHours > 0) addUnit('hour', remainderHours);
	if (parts.length === 0 && minutes > 0) addUnit('minute', minutes);
	if (parts.length === 0) parts.push('No lockup');

	return parts.join(', ');
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
		label: 'Internalised skimming',
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
export function calculateTvlWeightedApy(vaults: VaultInfo[]): number | null {
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
export function calculateTotalTvl(vaults: VaultInfo[]): number {
	return vaults.reduce((sum, v) => sum + (v.current_nav ?? 0), 0);
}
