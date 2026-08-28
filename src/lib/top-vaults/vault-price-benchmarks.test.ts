import { describe, expect, test } from 'vitest';
import { getVaultPriceBenchmarkTokens } from './vault-price-benchmarks';

const gmxVault = (vault_slug: string, name = 'GM [WBTC-USDC]') => ({
	flags: [],
	chain_id: 42161,
	name,
	protocol_slug: 'gmx',
	vault_slug
});

describe('getVaultPriceBenchmarkTokens', () => {
	test('compares a GM BTC pool with BTC only', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('gm-btc-wbtc-usdc', 'GM BTC [WBTC-USDC]'))).toEqual(['BTC']);
	});

	test('compares a GM ETH pool with ETH only', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('gm-eth-weth-usdc', 'GM ETH [WETH-USDC]'))).toEqual(['ETH']);
	});

	test('compares other GM pools with BTC and ETH', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('gm-aster-wbtc-usdc'))).toEqual(['BTC', 'ETH']);
	});

	test('keeps the Treasury benchmark for stable-stable GM swap pools', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('gm-swap-usdc-usdt0', 'GM swap [USDC-USD₮0]'))).toEqual([]);
	});

	test('recognises additional GMX stablecoin assets', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('gm-swap-usdg-usds', 'GM swap [USDG-USDS]'))).toEqual([]);
	});

	test('compares a crypto GM swap pool with BTC and ETH', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('gm-swap-wsteth-weth', 'GM swap [wstETH-WETH]'))).toEqual([
			'BTC',
			'ETH'
		]);
	});

	test('compares GLV pools with BTC and ETH', () => {
		expect(getVaultPriceBenchmarkTokens(gmxVault('glv-wbtc-usdc'))).toEqual(['BTC', 'ETH']);
	});

	test('keeps both benchmarks for perpetual futures vaults', () => {
		expect(
			getVaultPriceBenchmarkTokens({
				flags: ['perp_dex_trading_vault'],
				chain_id: 1,
				name: 'Perp vault',
				protocol_slug: 'trading-strategy',
				vault_slug: 'perp-vault'
			})
		).toEqual(['BTC', 'ETH']);
	});

	test('keeps the Treasury benchmark for non-GMX vaults', () => {
		expect(
			getVaultPriceBenchmarkTokens({
				flags: [],
				chain_id: 1,
				name: 'USDC vault',
				protocol_slug: 'aave',
				vault_slug: 'gm-swap-usdc-usdt'
			})
		).toEqual([]);
	});
});
