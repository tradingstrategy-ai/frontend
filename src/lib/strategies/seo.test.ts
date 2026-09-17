import { describe, expect, it } from 'vitest';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '$lib/helpers/seo';
import { getStrategyPageMeta } from './seo';

const base = { name: 'Vega', shortDescription: 'Momentum strategy trading ETH and BTC on Base.' };

describe('getStrategyPageMeta', () => {
	it('states the page type and chain in the title', () => {
		const { title } = getStrategyPageMeta({ ...base, chainName: 'Base' });
		expect(title).toBe('Vega — automated DeFi vault on Base | Trading Strategy');
	});

	it('drops title detail until it fits the display length', () => {
		const long = { ...base, name: 'Hyperliquid vault of vaults', chainName: 'HyperEVM' };
		const { title } = getStrategyPageMeta(long);
		expect(title).toBe('Hyperliquid vault of vaults — DeFi vault | Trading Strategy');
		expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);

		const veryLong = { ...base, name: 'An unreasonably long strategy name that exceeds the limit' };
		expect(getStrategyPageMeta(veryLong).title).toBe(`${veryLong.name} | Trading Strategy`);
	});

	it('copes with a missing short description', () => {
		const { description } = getStrategyPageMeta({ name: 'Vega', shortDescription: null, chainName: 'Base' });
		expect(description).toBe('Automated DeFi trading vault on Base.');
	});

	it('omits the chain when unknown', () => {
		expect(getStrategyPageMeta(base).title).toBe('Vega — DeFi vault | Trading Strategy');
		expect(getStrategyPageMeta(base).description).toBe(`${base.shortDescription} Automated DeFi trading vault.`);
	});

	it('leads the description with return and TVL when both are positive', () => {
		const { description } = getStrategyPageMeta({
			...base,
			chainName: 'Base',
			annualReturn: 0.1234,
			tvlUsd: 1_234_567
		});
		expect(description).toBe(
			'Vega: 12.3% annualised return, $1.2M TVL. Automated DeFi trading vault on Base. Momentum strategy trading ETH and BTC on Base.'
		);
	});

	it('falls back to the short description when a metric is missing, zero or negative', () => {
		const fallback = `${base.shortDescription} Automated DeFi trading vault on Base.`;
		for (const metrics of [
			{ annualReturn: null, tvlUsd: 1_000 },
			{ annualReturn: 0.1, tvlUsd: undefined },
			{ annualReturn: 0, tvlUsd: 1_000 },
			{ annualReturn: -0.2, tvlUsd: 1_000 },
			{ annualReturn: Number.NaN, tvlUsd: 1_000 },
			{ annualReturn: 0.1, tvlUsd: 0 }
		]) {
			const { description } = getStrategyPageMeta({ ...base, chainName: 'Base', ...metrics });
			expect(description, JSON.stringify(metrics)).toBe(fallback);
			expect(description).not.toContain('NaN');
		}
	});

	it('truncates long descriptions at a word boundary', () => {
		const shortDescription = 'word '.repeat(60).trim();
		const { description } = getStrategyPageMeta({ ...base, shortDescription });
		expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
		expect(description.endsWith('word…')).toBe(true);
	});
});
