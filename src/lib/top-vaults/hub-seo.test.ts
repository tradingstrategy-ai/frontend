import { describe, expect, test } from 'vitest';
import { formatDataDate, getHubDescription, getHubTitleParts, getItemListElements } from './hub-seo';

describe('formatDataDate', () => {
	test('formats a dataset timestamp in UK day-month-year order', () => {
		expect(formatDataDate('2026-09-25T04:10:49Z')).toBe('25 Sept 2026');
		expect(formatDataDate(new Date('2026-01-02T23:59:00Z'))).toBe('2 Jan 2026');
	});

	test('returns undefined for missing or invalid dates', () => {
		expect(formatDataDate(null)).toBeUndefined();
		expect(formatDataDate('not a date')).toBeUndefined();
	});
});

describe('getHubDescription', () => {
	test('leads with the count and figures in search wording', () => {
		expect(
			getHubDescription({
				subject: 'Morpho vaults',
				count: 214,
				totalTvl: 1_234_567_890,
				apy: 0.0612,
				updatedAt: '2026-09-25T04:10:49Z',
				about: 'Decentralised lending protocol.'
			})
		).toBe(
			'Compare 214 listed Morpho vaults by APY, TVL and risk: $1.2B TVL, 6.1% average APY (TVL-weighted, 30 days). Data updated 25 Sept 2026. Decentralised lending protocol.'
		);
	});

	test('leaves out figures that are missing instead of printing placeholders', () => {
		const description = getHubDescription({ subject: 'Euler vaults', count: 0, totalTvl: null, apy: null });
		expect(description).toBe('Compare Euler vaults by APY, TVL and risk.');
		expect(description).not.toContain('---');
	});

	test('keeps a negative average APY, which is a real figure', () => {
		expect(getHubDescription({ subject: 'Lighter vaults', count: 3, apy: -0.02 })).toContain('-2.0% average APY');
	});
});

describe('getItemListElements', () => {
	test('lists the rendered rows in order with absolute vault URLs', () => {
		expect(
			getItemListElements(
				[
					{ name: 'Alpha', vault_slug: 'alpha' },
					{ name: 'Beta', vault_slug: 'beta' }
				],
				'https://tradingstrategy.ai'
			)
		).toEqual([
			{ '@type': 'ListItem', position: 1, name: 'Alpha', url: 'https://tradingstrategy.ai/vaults/alpha' },
			{ '@type': 'ListItem', position: 2, name: 'Beta', url: 'https://tradingstrategy.ai/vaults/beta' }
		]);
	});
});

describe('getHubTitleParts', () => {
	test('keeps the most descriptive qualifier that fits', () => {
		expect(getHubTitleParts('Morpho vaults', ['APY, TVL and curators', 'APY and TVL'])).toEqual([
			'Morpho vaults',
			'APY, TVL and curators'
		]);
		// 'Hyperliquid vaults | APY, TVL and curators | Trading Strategy' is 61 characters
		expect(getHubTitleParts('Hyperliquid vaults', ['APY, TVL and curators', 'APY and TVL'])).toEqual([
			'Hyperliquid vaults',
			'APY and TVL'
		]);
	});

	test('falls back to the heading alone', () => {
		expect(getHubTitleParts('An unusually long curator name for vaults', ['APY and TVL'])).toEqual([
			'An unusually long curator name for vaults'
		]);
	});
});
