import { describe, expect, it } from 'vitest';
import { getVaultCategoryLinks, getVaultCategorySlug, getVaultCategoryTag } from './categories';

describe('vault categories', () => {
	it('converts source tags to dash-separated public slugs and back', () => {
		expect(getVaultCategorySlug('directional_trading')).toBe('directional-trading');
		expect(getVaultCategoryTag('directional-trading')).toBe('directional_trading');
	});

	it('links only registered categories in alphabetical display order without duplicates', () => {
		const links = getVaultCategoryLinks(
			{
				strategy_tags: [
					'yield_optimisation',
					'unknown_tag',
					'algorithmic_trading',
					'algorithmic_trading',
					'constructor'
				]
			},
			{
				algorithmic_trading: {
					label: 'Algorithmic trading',
					description: 'Systematic strategies.',
					vault_count: 1,
					tvl_usd: 1,
					one_month_apy: null
				},
				yield_optimisation: {
					label: 'Yield optimisation',
					description: 'Yield strategies.',
					vault_count: 1,
					tvl_usd: 1,
					one_month_apy: null
				}
			}
		);

		expect(links).toEqual([
			{ slug: 'algorithmic-trading', label: 'Algorithmic trading' },
			{ slug: 'yield-optimisation', label: 'Yield optimisation' }
		]);
	});
});
