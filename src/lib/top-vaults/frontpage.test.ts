import { describe, expect, test } from 'vitest';
import { getFrontpageVaults } from './frontpage';
import { createTestVault } from './test-utils';

describe('getFrontpageVaults', () => {
	test('counts all non-blacklisted TVL regardless of highlight eligibility', () => {
		const vaults = [
			createTestVault('Eligible', { current_nav: 100_000, risk: 'Low', three_months_cagr: 0.1 }),
			createTestVault('Unknown protocol', { protocol: '<unknown>', current_nav: 200_000, risk: 'Low' }),
			createTestVault('Unrated', { current_nav: 300_000 }),
			createTestVault('Dangerous', { current_nav: 400_000, risk: 'Dangerous' }),
			createTestVault('Small', { current_nav: 100, risk: 'Low' }),
			createTestVault('AMM', { current_nav: 500_000, risk: 'Low', features: ['amm_pool_like'] }),
			createTestVault('Blacklisted', { current_nav: 1_000_000, risk: 'Blacklisted' }),
			{ ...createTestVault('Label-only blacklist', { current_nav: 2_000_000 }), risk: 'Blacklisted' }
		];

		const result = getFrontpageVaults(vaults);
		expect(result.aggregates.totalTvl).toBe(1_500_100);
		expect(result.vaults.map((v) => v.name)).toEqual(['Eligible']);
	});

	test('excludes extreme and unavailable returns without reducing headline TVL', () => {
		const props = { current_nav: 100_000, risk: 'Low' } as const;
		const result = getFrontpageVaults([
			createTestVault('Normal', { ...props, three_months_cagr: 0.1 }),
			createTestVault('Extreme gross', { ...props, three_months_cagr: 100 }),
			createTestVault('Extreme net', { ...props, three_months_cagr: 0.1, three_months_cagr_net: 100 }),
			createTestVault('Unavailable', props),
			{ ...createTestVault('Infinite', props), three_months_cagr: Infinity },
			{ ...createTestVault('NaN', props), three_months_cagr_net: NaN }
		]);

		expect(result.vaults.map((v) => v.name)).toEqual(['Normal']);
		expect(result.aggregates.totalTvl).toBe(600_000);
		expect(result.aggregates.rankedVaultCount).toBe(1);
		expect(result.aggregates.weightedAvgApy).toBeCloseTo(0.1);
	});

	test('uses net returns for the outlier limit and includes its boundary', () => {
		const props = { current_nav: 100_000, risk: 'Low' } as const;
		const result = getFrontpageVaults([
			createTestVault('Valid net', { ...props, three_months_cagr: 100, three_months_cagr_net: 0.1 }),
			createTestVault('Boundary', { ...props, three_months_cagr: 10 }),
			createTestVault('Above boundary', { ...props, three_months_cagr: 10.001 }),
			createTestVault('Negative', { ...props, three_months_cagr: -0.1 })
		]);

		expect(result.vaults.map((v) => v.name)).toEqual(['Valid net', 'Boundary', 'Negative']);
		expect(result.aggregates.rankedVaultCount).toBe(3);
		expect(result.aggregates.weightedAvgApy).toBeCloseTo(10 / 3);
	});

	test('excludes AMM vaults from highlights and the weighted APY', () => {
		const result = getFrontpageVaults([
			createTestVault('AMM', {
				current_nav: 500_000,
				risk: 'Low',
				features: ['amm_pool_like'],
				three_months_cagr: 1
			}),
			createTestVault('Lower return', { current_nav: 100_000, risk: 'Low', three_months_cagr: 0.1 }),
			createTestVault('Higher return', {
				current_nav: 300_000,
				risk: 'Low',
				three_months_cagr: 0.3,
				three_months_cagr_net: 0.2
			})
		]);

		expect(result.vaults.map((v) => v.name)).toEqual(['Higher return', 'Lower return']);
		expect(result.aggregates.rankedVaultCount).toBe(2);
		expect(result.aggregates.weightedAvgApy).toBeCloseTo(0.175);
	});

	test('limits cards to five while calculating metrics over the full population', () => {
		const vaults = Array.from({ length: 6 }, (_, i) =>
			createTestVault(`Vault ${i}`, { current_nav: 100_000, risk: 'Low', three_months_cagr: i / 10 })
		);
		const result = getFrontpageVaults(vaults);
		expect(result.vaults.map((v) => v.name)).toEqual(['Vault 5', 'Vault 4', 'Vault 3', 'Vault 2', 'Vault 1']);
		expect(result.aggregates.totalTvl).toBe(600_000);
		expect(result.aggregates.rankedVaultCount).toBe(6);
		expect(result.aggregates.weightedAvgApy).toBeCloseTo(0.25);
		expect(getFrontpageVaults([])).toEqual({
			vaults: [],
			aggregates: { totalTvl: 0, rankedVaultCount: 0, weightedAvgApy: 0 }
		});
	});
});
