import { describe, expect, test } from 'vitest';
import { getSimilarVaults } from './similar-vaults';
import { createTestVault } from './test-utils';

const morpho = (name: string, props = {}) =>
	createTestVault(name, { protocol: 'Morpho', chain_id: 1, current_nav: 1_000_000, peak_nav: 1_000_000, ...props });

describe('getSimilarVaults', () => {
	const vault = morpho('Steakhouse USDC');

	test('prefers the same denomination, then the largest vaults on the protocol', () => {
		const vaults = [
			vault,
			morpho('Small USDC', { current_nav: 50_000, peak_nav: 50_000 }),
			morpho('Large USDC', { current_nav: 9_000_000, peak_nav: 9_000_000 }),
			morpho('Huge USDT', { denomination: 'USDT', current_nav: 90_000_000, peak_nav: 90_000_000 }),
			createTestVault('Euler USDC', { protocol: 'Euler', chain_id: 1, current_nav: 5_000_000, peak_nav: 5_000_000 })
		];

		expect(getSimilarVaults(vault, vaults).map((row) => row.name)).toEqual(['Large USDC', 'Small USDC', 'Huge USDT']);
	});

	test('leaves out the vault itself, blacklisted and noindex vaults', () => {
		const vaults = [
			vault,
			morpho('Blacklisted USDC', { risk: 'Blacklisted' }),
			morpho('Dust USDC', { current_nav: 10, peak_nav: 10 }),
			morpho('NewBet'),
			morpho('Real USDC')
		];

		expect(getSimilarVaults(vault, vaults).map((row) => row.name)).toEqual(['Real USDC']);
	});

	test('returns headline figures and respects the limit', () => {
		const vaults = Array.from({ length: 8 }, (_, i) =>
			morpho(`Vault ${i}`, { current_nav: 1_000_000 + i, one_month_cagr: 0.05 })
		);

		const rows = getSimilarVaults(vault, vaults, { limit: 3 });
		expect(rows).toHaveLength(3);
		expect(rows[0]).toEqual({ name: 'Vault 7', slug: 'vault-7', apy: 0.05, tvlUsd: 1_000_007 });
	});
});
