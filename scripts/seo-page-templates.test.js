import { describe, expect, it } from 'vitest';
import { getPageTemplate, summariseByTemplate } from './seo-page-templates.mjs';

describe('getPageTemplate', () => {
	it.each([
		['https://tradingstrategy.ai/', 'home'],
		['https://tradingstrategy.ai/vaults', 'vaults index'],
		['https://tradingstrategy.ai/vaults?sort=tvl', 'vaults index'],
		['https://tradingstrategy.ai/vaults/protocols', 'vault hub index'],
		['https://tradingstrategy.ai/vaults/chains/hyperliquid', 'vault chain hub'],
		['https://tradingstrategy.ai/vaults/protocols/morpho', 'vault protocol hub'],
		['https://tradingstrategy.ai/vaults/stablecoins/usdc', 'vault stablecoin hub'],
		['https://tradingstrategy.ai/vaults/curators/re7-labs/', 'vault curator hub'],
		['https://tradingstrategy.ai/vaults/categories/delta-neutral', 'vault strategy hub'],
		['https://tradingstrategy.ai/vaults/high-tvl', 'vault listing or tool'],
		['https://tradingstrategy.ai/vaults/yield-risk', 'vault listing or tool'],
		['https://tradingstrategy.ai/vaults/historical-tvl-chain', 'vault listing or tool'],
		['https://tradingstrategy.ai/vaults/ether-fi-liquid-rwa', 'vault detail'],
		['https://tradingstrategy.ai/strategies/vega', 'strategy'],
		['https://tradingstrategy.ai/trading-view/ethereum/tokens/0xabc', 'token'],
		['https://tradingstrategy.ai/glossary/leverage', 'glossary'],
		['https://tradingstrategy.ai/pricing', 'other']
	])('classifies %s as %s', (url, template) => {
		expect(getPageTemplate(url)).toBe(template);
	});
});

describe('summariseByTemplate', () => {
	it('sums clicks and impressions and weights position by impressions', () => {
		const summary = summariseByTemplate([
			{ keys: ['https://tradingstrategy.ai/vaults/a'], clicks: 1, impressions: 100, position: 5 },
			{ keys: ['https://tradingstrategy.ai/vaults/b'], clicks: 3, impressions: 300, position: 9 },
			{ keys: ['https://tradingstrategy.ai/vaults'], clicks: 2, impressions: 50, position: 20 }
		]);

		expect(summary.get('vault detail')).toEqual({ pages: 2, clicks: 4, impressions: 400, ctr: 0.01, position: 8 });
		expect(summary.get('vaults index')?.pages).toBe(1);
	});
});
