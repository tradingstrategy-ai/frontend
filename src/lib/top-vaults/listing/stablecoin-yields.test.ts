import { describe, expect, test } from 'vitest';
import { createTestVault } from '../test-utils';
import { getStablecoinYieldComparison } from './stablecoin-yields';

const vault = (name: string, props = {}) =>
	createTestVault(name, { protocol: 'Morpho', chain_id: 1, years: 1, risk: 'Low', one_month_cagr: 0.05, ...props });

// resolve the legacy `usdc-e` alias to the canonical `usdc` slug
const resolveSlug = (v: { denomination_slug: string }) =>
	v.denomination_slug === 'usdc-e' ? 'usdc' : v.denomination_slug;

describe('getStablecoinYieldComparison', () => {
	test('ranks stablecoins by USD TVL and groups aliases under the canonical slug', () => {
		const rows = getStablecoinYieldComparison(
			[
				vault('USDC A', { denomination: 'USDC', current_nav: 5_000_000, one_month_cagr: 0.06 }),
				vault('USDC.e B', { denomination: 'USDC-E', current_nav: 5_000_000, one_month_cagr: 0.09 }),
				vault('USDT A', { denomination: 'USDT', current_nav: 3_000_000 })
			],
			{ resolveSlug, getName: (slug) => (slug === 'usdc' ? 'USD Coin' : undefined) }
		);

		expect(rows.map((row) => [row.slug, row.tvlUsd])).toEqual([
			['usdc', 10_000_000],
			['usdt', 3_000_000]
		]);
		expect(rows[0].name).toBe('USD Coin');
		expect(rows[0].best?.name).toBe('USDC.e B');
		expect(rows[0].compared).toBe(2);
	});

	test('keeps a large stablecoin whose vaults do not qualify, with no leader', () => {
		const rows = getStablecoinYieldComparison(
			[
				vault('Big but new', { denomination: 'USDC', current_nav: 50_000_000, years: 0.1 }),
				vault('Small', { denomination: 'USDT', current_nav: 200_000 })
			],
			{ resolveSlug, limit: 1 }
		);

		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ slug: 'usdc', best: null, compared: 0 });
	});
});
