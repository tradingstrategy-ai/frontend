import { describe, expect, it } from 'vitest';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, getMetaDescription, getPageTitle, truncateAtWord } from './seo';

describe('getPageTitle', () => {
	it('joins the parts and appends the brand', () => {
		expect(getPageTitle(['ETH-USDC', 'Uniswap v3 on Ethereum'])).toBe(
			'ETH-USDC | Uniswap v3 on Ethereum | Trading Strategy'
		);
	});

	it('drops the least specific parts until the title fits', () => {
		const title = getPageTitle([
			'Some very long trading pair name (0.05%)',
			'Uniswap v3 on Ethereum',
			'DEX trading pair'
		]);
		expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
		expect(title).toBe('Some very long trading pair name (0.05%) | Trading Strategy');
	});

	it('keeps the first part and the brand even when that overruns the limit', () => {
		const name = 'x'.repeat(70);
		expect(getPageTitle([name])).toBe(`${name} | Trading Strategy`);
	});

	it('skips blank parts and falls back to the brand alone', () => {
		expect(getPageTitle(['', null, undefined])).toBe('Trading Strategy');
		expect(getPageTitle(['WETH', '  ', 'Ethereum token'])).toBe('WETH | Ethereum token | Trading Strategy');
	});
});

describe('getMetaDescription', () => {
	it('uses the first non-blank candidate, collapses whitespace and truncates', () => {
		const long = 'word '.repeat(60);
		const description = getMetaDescription([null, '  ', `first\n\n${long}`]);
		expect(description.startsWith('first word word')).toBe(true);
		expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
		expect(description.endsWith('…')).toBe(true);
	});

	it('returns the fallback when nothing is set', () => {
		expect(getMetaDescription([undefined], 'Fallback text')).toBe('Fallback text');
	});
});

describe('truncateAtWord', () => {
	it('cuts on a word boundary and trims trailing punctuation', () => {
		expect(truncateAtWord('alpha beta, gamma delta', 12)).toBe('alpha beta…');
		expect(truncateAtWord('short', 12)).toBe('short');
	});
});
