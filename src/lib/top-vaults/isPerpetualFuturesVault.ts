import type { VaultInfo } from './schemas';

/** Chain IDs for dedicated perpetual futures trading platforms. */
const PERP_CHAIN_IDS = new Set([
	9999, // HyperCore (Hyperliquid native)
	325, // GRVT
	9998 // Lighter
]);

/**
 * Whether a vault is a perpetual futures trading vault.
 *
 * Checks the `perp_dex_trading_vault` flag first, then falls back to
 * chain_id for synthetic perp-only chains that may lack the flag.
 *
 * HyperEVM (chain_id 999) is intentionally excluded — it is a regular
 * EVM chain that can host DeFi / lending vaults.
 */
export function isPerpetualFuturesVault(vault: Pick<VaultInfo, 'flags' | 'chain_id'>): boolean {
	return vault.flags.includes('perp_dex_trading_vault') || PERP_CHAIN_IDS.has(vault.chain_id);
}
