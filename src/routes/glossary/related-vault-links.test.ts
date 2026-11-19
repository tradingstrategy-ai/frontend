import { describe, expect, test } from 'vitest';
import { getRelatedVaultLinks } from './related-vault-links';

describe('getRelatedVaultLinks', () => {
	test('links the HLP glossary term to the HLP vault and the Hyperliquid hub', () => {
		expect(getRelatedVaultLinks('hyperliquid-provider-vault').map((link) => link.href)).toEqual([
			'/vaults/hyperliquidity-provider-hlp',
			'/vaults/protocols/hyperliquid'
		]);
	});

	test('links protocol and stablecoin terms to their vault hub', () => {
		expect(getRelatedVaultLinks('morpho').map((link) => link.href)).toEqual(['/vaults/protocols/morpho']);
		expect(getRelatedVaultLinks('usdc').map((link) => link.href)).toEqual(['/vaults/stablecoins/usdc']);
	});

	test('returns nothing for unrelated terms', () => {
		expect(getRelatedVaultLinks('stop-loss')).toEqual([]);
	});
});
