import { describe, expect, test } from 'vitest';
import { formatDataDate, getHubDescription } from './hub-seo';

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
