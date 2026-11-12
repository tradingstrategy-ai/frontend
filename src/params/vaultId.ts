import { SOLANA_CHAIN_ID, isSolanaVaultAddress } from '$lib/helpers/solana';

/**
 * Match chain-specific vault ID formats:
 * - EVM chains (Ethereum, Polygon, Arbitrum, Base, etc.): `${chainId}-0x${address}`
 * - HyperCore / GRVT (chain 325): `${chainId}-vlt:${id}`
 * - Lighter (chain 9998): `${chainId}-lighter-pool-${id}` or
 *   `${chainId}-lighter-pool-robinhood-${id}`
 * - Hibachi (chain 9997): `${chainId}-hibachi-vault-${id}`
 * - Solana (chain 9992): `${chainId}-solana-vault-${64 hex digits}`
 * - ApeX (chain 9995): `${chainId}-apex-vault-${id}`
 *
 * To add a new format, append a new alternative to the regex group.
 */
export function match(param: string) {
	const separator = param.indexOf('-');
	const chain = param.slice(0, separator);
	const address = param.slice(separator + 1);
	if (chain === String(SOLANA_CHAIN_ID)) return isSolanaVaultAddress(address);
	if (/^solana-vault-/i.test(address)) return false;
	return /^\d+-(0x[0-9a-f]+|vlt:[0-9a-z]+|lighter-pool-(?:robinhood-)?\d+|hibachi-vault-\d+|apex-vault-\d+)$/i.test(
		param
	);
}
