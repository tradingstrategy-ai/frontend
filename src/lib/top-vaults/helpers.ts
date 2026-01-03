import type { VaultInfo } from './schemas';
import { resolve } from '$app/paths';
import { getChain } from '$lib/helpers/chain';
import { isNumber } from '$lib/helpers/formatters';

/** Minimum TVL threshold for including vaults in listings */
export const minTvl = 10_000;

/**
 * Resolve path to vault datails page for a given vault
 */
export function resolveVaultDetails(vault: VaultInfo) {
	const chain = getChain(vault.chain_id);
	return resolve(`/trading-view/${chain?.slug}/vaults/${vault.vault_slug}`);
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
