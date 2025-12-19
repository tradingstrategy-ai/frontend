import { resolve } from '$app/paths';
import { getChain } from '$lib/helpers/chain';
import type { VaultInfo } from './schemas';

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

/**
 * Normalize denomination token to consistent value for use in URL path
 */
export function getNormalizedDenomination(vault: VaultInfo) {
	// prettier-ignore
	return vault.denomination
	  .replace('₮', 'T')
	  .replace(/\.e$/, '')
	  .replace('USDT0', 'USDT')
}
