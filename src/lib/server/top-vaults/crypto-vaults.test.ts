import { describe, expect, it } from 'vitest';
import { getVaultCurrentTvlUsd, getVaultPeakTvlUsd } from '$lib/top-vaults/helpers';
import { getVaultListingDefinition } from '$lib/top-vaults/listing/definitions';
import { queryVaultListing } from '$lib/top-vaults/listing/query';
import { getListingSearchParams, parseVaultListingQuery } from '$lib/top-vaults/listing/state';
import { createTestVault } from '$lib/top-vaults/test-utils';
import { parseCryptoVaultExport } from './crypto-vaults';

const generatedAt = '2026-11-21T12:00:00';

function makeCryptoVault(family: 'btc' | 'eth', assets: number, usdRate: number | null, curator = 'sigma-labs') {
	return {
		...createTestVault(`${curator} ${family}`, {
			curator_slug: curator,
			denomination: family === 'btc' ? 'cbBTC' : 'WETH',
			stablecoinish: false,
			one_month_cagr: 0.05
		}),
		denomination_family: family,
		current_total_assets: assets,
		peak_total_assets: assets * 2,
		periodic_metrics_usd: [
			{ exchange_rate_end: usdRate, period_end_at: generatedAt },
			{ exchange_rate_end: usdRate == null ? null : usdRate / 2, period_end_at: '2026-11-20T12:00:00' }
		]
	};
}

describe('curator crypto vaults', () => {
	it('scopes by curator and denomination and values the full filtered result in USD', () => {
		const { curators } = parseCryptoVaultExport({
			generated_at: generatedAt,
			vaults: [
				makeCryptoVault('btc', 2, 70_000),
				makeCryptoVault('eth', 20, 3_000),
				makeCryptoVault('eth', 200, 3_000, 'another-curator'),
				createTestVault('Stablecoin', { curator_slug: 'sigma-labs' })
			]
		});
		const sigma = curators.get('sigma-labs')!;
		const params = new URLSearchParams('tvl=2m&btc-tvl=100k&eth-tvl=10k');
		for (const [family, expectedTvl] of [
			['btc', 140_000],
			['eth', 60_000]
		] as const) {
			const { defaults, options } = getVaultListingDefinition(`curator-${family}`);
			const query = parseVaultListingQuery(getListingSearchParams(params, `${family}-`), defaults);
			const listing = queryVaultListing(sigma[family], query, options);
			expect(listing.vaults).toHaveLength(1);
			expect(listing.totalTvl).toBe(expectedTvl);
			expect(getVaultPeakTvlUsd(listing.vaults[0])).toBe(expectedTvl * 2);
			expect(listing.avgTvlWeightedApy1M).toBe(0.05);
		}
	});

	it('leaves USD TVL unknown when a crypto vault has no usable exchange rate', () => {
		const { curators } = parseCryptoVaultExport({
			generated_at: generatedAt,
			vaults: [makeCryptoVault('eth', 10, null)]
		});
		const vault = curators.get('sigma-labs')!.eth[0];
		expect(vault.current_nav).toBe(10);
		expect(getVaultCurrentTvlUsd(vault)).toBeNull();
		expect(getVaultPeakTvlUsd(vault)).toBeNull();
	});
});
