import { describe, expect, it } from 'vitest';
import { getFontPreloadLinks } from './font-preload';

describe('getFontPreloadLinks', () => {
	it('preloads the stylesheet everywhere', () => {
		expect(getFontPreloadLinks('/vaults')).toBe('</fonts/fonts6.css>; rel=preload; as=style');
		expect(getFontPreloadLinks('/trading-view/ethereum')).not.toContain('woff2');
	});

	it('preloads the primary faces on text-led templates', () => {
		for (const path of [
			'/',
			'/vaults/return-leader-alpha',
			'/glossary/leverage',
			'/blog/episode-12-atoma',
			'/trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
			'/trading-view/ethereum/uniswap-v3/eth-usdc-fee-5'
		]) {
			const links = getFontPreloadLinks(path);
			expect(links).toContain('fonts6.css');
			expect(links).toContain('NeueHaasGroteskDisplay/65.woff2');
			expect(links).toContain('NeueHaasGroteskText/55.woff2');
			expect(links).toContain('NeueHaasGroteskText/65.woff2');
		}
	});
});
