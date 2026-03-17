import { describe, expect, test } from 'vitest';
import { buildMarketSharePieSlices } from '../market-share-pie';

describe('buildMarketSharePieSlices', () => {
	test('excludes zero-TVL stablecoins from the pie', () => {
		const slices = buildMarketSharePieSlices([
			{ slug: 'usdc', label: 'USDC', name: 'USD Coin', tvl: 100, avgApy: 0.1, href: '/usdc' },
			{ slug: 'dai', label: 'DAI', name: 'Dai', tvl: 0, avgApy: 0.08, href: '/dai' }
		]);

		expect(slices).toHaveLength(1);
		expect(slices[0].label).toBe('USDC');
	});

	test('groups stablecoins below the threshold into Other', () => {
		const slices = buildMarketSharePieSlices(
			[
				{ slug: 'usdc', label: 'USDC', name: 'USD Coin', tvl: 600, avgApy: 0.1, href: '/usdc' },
				{ slug: 'usdt', label: 'USDT', name: 'Tether', tvl: 300, avgApy: 0.09, href: '/usdt' },
				{ slug: 'dai', label: 'DAI', name: 'Dai', tvl: 60, avgApy: 0.08, href: '/dai' },
				{ slug: 'lusd', label: 'LUSD', name: 'Liquity USD', tvl: 30, avgApy: 0.07, href: '/lusd' },
				{ slug: 'susd', label: 'SUSD', name: 'sUSD', tvl: 17, avgApy: 0.05, href: '/susd' }
			],
			{ groupLabelPlural: 'stablecoins' }
		);

		expect(slices.map((slice) => slice.label)).toEqual(['USDC', 'USDT', 'DAI', 'LUSD', 'Other']);
		const other = slices.find((slice) => slice.isOther);
		expect(other).toMatchObject({
			label: 'Other',
			name: 'Other stablecoins',
			memberCount: 1,
			tvl: 17
		});
	});

	test('computes Other TVL-weighted APY from grouped members', () => {
		const slices = buildMarketSharePieSlices(
			[
				{ slug: 'usdc', label: 'USDC', name: 'USD Coin', tvl: 971, avgApy: 0.1, href: '/usdc' },
				{ slug: 'frax', label: 'FRAX', name: 'Frax', tvl: 19, avgApy: 0.2, href: '/frax' },
				{ slug: 'gusd', label: 'GUSD', name: 'Gemini Dollar', tvl: 10, avgApy: 0.05, href: '/gusd' }
			],
			{ groupLabelPlural: 'stablecoins' }
		);

		const other = slices.find((slice) => slice.isOther);
		expect(other?.avgApy).toBeCloseTo(0.14827586);
	});

	test('keeps a stablecoin at exactly two percent as a standalone slice', () => {
		const slices = buildMarketSharePieSlices([
			{ slug: 'usdc', label: 'USDC', name: 'USD Coin', tvl: 980, avgApy: 0.1, href: '/usdc' },
			{ slug: 'dai', label: 'DAI', name: 'Dai', tvl: 20, avgApy: 0.08, href: '/dai' }
		]);

		expect(slices.map((slice) => slice.label)).toEqual(['USDC', 'DAI']);
		expect(slices.some((slice) => slice.isOther)).toBe(false);
	});
});
