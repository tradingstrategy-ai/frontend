import type { VaultInfo } from './schemas';
import { resolve } from '$app/paths';
import { capitalize, isNumber } from '$lib/helpers/formatters';

/** Minimum TVL threshold for vault group breakdown pages */
export const MIN_TVL_THRESHOLD = 10_000;

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
