/** Reserved native Solana mainnet dataset ID shared with eth_defi; not an EVM chain ID. */
export const SOLANA_CHAIN_ID = 9992;

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const VAULT_PREFIX = 'solana-vault-';

/**
 * Decode a canonical 32-byte base58 account, including off-curve PDAs.
 * @param address Case-sensitive account text without surrounding whitespace.
 */
function decodeAccount(address: string): string | null {
	if (address.trim() !== address || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return null;
	let value = 0n;
	for (const character of address) value = value * 58n + BigInt(BASE58.indexOf(character));
	const hex = value === 0n ? '' : value.toString(16);
	const leadingZeros = address.match(/^1*/)?.[0].length ?? 0;
	if (leadingZeros + Math.ceil(hex.length / 2) !== 32) return null;
	return hex.padStart(64, '0');
}

/**
 * Validate canonical base58 account encoding without requiring a signing key or network access.
 * @param address Candidate Solana account; letter case is significant.
 */
export function isSolanaAddress(address: string): boolean {
	return decodeAccount(address) !== null;
}

/**
 * Validate the complete provider-neutral storage key used by the vault dataset.
 * @param address Candidate storage key containing exactly 32 hex bytes.
 */
export function isSolanaVaultAddress(address: string): boolean {
	return address.length === VAULT_PREFIX.length + 64 && /^solana-vault-[0-9a-f]{64}$/i.test(address);
}

/**
 * Convert a native account to the reversible lowercase-safe dataset identity.
 * @param address Exact base58 account, including program-derived accounts.
 */
export function makeSolanaVaultAddress(address: string): string {
	const hex = decodeAccount(address);
	if (hex === null) throw new Error('Invalid Solana account address');
	return VAULT_PREFIX + hex;
}

/**
 * Restore the case-sensitive native address for display, copying and explorer links.
 * @param address Complete provider-neutral Solana vault storage key.
 */
export function decodeSolanaVaultAddress(address: string): string {
	if (!isSolanaVaultAddress(address)) throw new Error('Invalid Solana vault identity');
	const hex = address.slice(VAULT_PREFIX.length);
	let value = BigInt('0x' + hex);
	let account = '';
	while (value > 0n) {
		account = BASE58[Number(value % 58n)] + account;
		value /= 58n;
	}
	const leadingZeros = (hex.match(/^(?:00)*/)?.[0].length ?? 0) / 2;
	return '1'.repeat(leadingZeros) + account;
}
