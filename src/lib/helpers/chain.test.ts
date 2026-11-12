import { makeSolanaVaultAddress } from './solana';
import { describe, expect, test } from 'vitest';
import { getChainDisplayName, getChain, getExplorerUrl, isPerpDexChainId } from './chain';

describe('getChainDisplayName', () => {
	test('distinguishes HyperEVM from the Hyperliquid grouping', () => {
		expect(getChainDisplayName(999)).toBe('HyperEVM');
		expect(getChainDisplayName(9999)).toBe('Hyperliquid');
		expect(getChain('hyperliquid')?.name).toBe('Hyperliquid');
	});
});

describe('Solana vault-only chain', () => {
	test('registers the shared native dataset without oracle support or perp classification', () => {
		expect(getChain('solana')).toMatchObject({ id: 9992, nativeCurrency: 'SOL', hasBackendData: false });
		expect(getChainDisplayName(9992)).toBe('Solana');
		expect(isPerpDexChainId(9992)).toBe(false);
		expect(isPerpDexChainId(9999)).toBe(true);
	});

	test('links native accounts and encoded vault identities to Solscan', () => {
		const address = 'J7qhMAKnB6G5dvoAN9281ufabajKbyGQxxd2bq6R7fPJ';
		const chain = getChain(9992);
		expect(getExplorerUrl(chain, address)).toBe(`https://solscan.io/account/${address}`);
		expect(getExplorerUrl(chain, makeSolanaVaultAddress(address))).toBe(`https://solscan.io/account/${address}`);
		expect(getExplorerUrl(chain, 'invalid')).toBe('https://solscan.io');
		expect(getExplorerUrl(getChain(1), `0x${'a'.repeat(40)}`)).toBe(`https://etherscan.io/address/0x${'a'.repeat(40)}`);
	});
});
