import { describe, expect, test } from 'vitest';
import { getPageTitle, TITLE_MAX_LENGTH } from '$lib/helpers/seo';
import { createTestVault } from './test-utils';
import { getGeneratedVaultDescription, getVaultTitleParts } from './vault-seo';

describe('getVaultTitleParts', () => {
	test('names the protocol and chain when they fit', () => {
		const vault = createTestVault('Alpha USDC', { protocol: 'Morpho', protocol_slug: 'morpho', chain_id: 1 });
		const parts = getVaultTitleParts(vault);
		expect(parts).toEqual(['Alpha USDC', 'Morpho vault on Ethereum']);
		expect(getPageTitle(parts)).toBe('Alpha USDC | Morpho vault on Ethereum | Trading Strategy');
	});

	test('drops the chain, then the protocol, as the name gets longer', () => {
		const midName = createTestVault('Alpha USDC Delta Neutral', {
			protocol: 'Morpho',
			protocol_slug: 'morpho',
			chain_id: 1
		});
		expect(getVaultTitleParts(midName)).toEqual(['Alpha USDC Delta Neutral', 'Morpho vault']);

		const longName = createTestVault('Alpha USDC Delta Neutral Enhanced Yield', {
			protocol: 'Morpho',
			protocol_slug: 'morpho',
			chain_id: 1
		});
		const parts = getVaultTitleParts(longName);
		expect(parts).toEqual(['Alpha USDC Delta Neutral Enhanced Yield']);
		expect(getPageTitle(parts).length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
	});

	test('says "DeFi vault" when the protocol is unknown', () => {
		const vault = createTestVault('Mystery yield', { protocol: '<protocol not yet identified>', chain_id: 1 });
		expect(getVaultTitleParts(vault)).toEqual(['Mystery yield', 'DeFi vault']);
	});

	test('uses the asset type of pools and tokenised funds', () => {
		const fund = createTestVault('RWA fund', {
			protocol: 'Midas',
			protocol_slug: 'midas',
			chain_id: 1,
			flags: ['tokenised_fund']
		});
		expect(getVaultTitleParts(fund)).toEqual(['RWA fund', 'Midas tokenised fund']);
	});
});

describe('getGeneratedVaultDescription', () => {
	test('labels APY as annualised and TVL in USD', () => {
		const vault = createTestVault('Alpha USDC', {
			protocol: 'Morpho',
			protocol_slug: 'morpho',
			chain_id: 1,
			current_nav: 12_300_000,
			one_month_cagr_net: 0.074,
			one_month_cagr: 0.08,
			risk: 'Low'
		});
		expect(getGeneratedVaultDescription(vault)).toBe(
			'Alpha USDC is a Morpho vault on Ethereum: APY 7.4% (annualised, last 30 days), TVL $12.3M, risk: Low.'
		);
	});

	test('leaves out figures it cannot state in the right unit', () => {
		// a WETH vault with only an ETH rate: its NAV is not a dollar figure
		const vault = createTestVault('WETH vault', {
			protocol: 'Morpho',
			protocol_slug: 'morpho',
			chain_id: 1,
			denomination: 'WETH',
			stablecoinish: false,
			denomination_token_rate: {
				coingecko_id: null,
				source_currency: null,
				usd_rate: null,
				usd_rate_fetched_at: null,
				usd_rate_source: null,
				native_rate: null,
				native_rate_currency: 'eth',
				native_rate_fetched_at: null,
				native_rate_source: null,
				source_currency_usd_rate: null,
				source_currency_usd_rate_fetched_at: null,
				source_currency_usd_rate_source: null
			},
			current_nav: 10,
			one_month_cagr_net: null,
			one_month_cagr: null
		});
		expect(getGeneratedVaultDescription(vault)).toBe('WETH vault is a Morpho vault on Ethereum.');
	});
});
