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

	test('groups entries after the standalone slice limit into Other', () => {
		const slices = buildMarketSharePieSlices(
			[
				{ slug: 'fund-1', label: 'Fund 1', name: 'Fund 1', tvl: 100, avgApy: 0.01, href: '/fund-1' },
				{ slug: 'fund-2', label: 'Fund 2', name: 'Fund 2', tvl: 90, avgApy: 0.02, href: '/fund-2' },
				{ slug: 'fund-3', label: 'Fund 3', name: 'Fund 3', tvl: 80, avgApy: 0.03, href: '/fund-3' },
				{ slug: 'fund-4', label: 'Fund 4', name: 'Fund 4', tvl: 70, avgApy: 0.04, href: '/fund-4' },
				{ slug: 'fund-5', label: 'Fund 5', name: 'Fund 5', tvl: 60, avgApy: 0.05, href: '/fund-5' },
				{ slug: 'fund-6', label: 'Fund 6', name: 'Fund 6', tvl: 50, avgApy: 0.06, href: '/fund-6' },
				{ slug: 'fund-7', label: 'Fund 7', name: 'Fund 7', tvl: 40, avgApy: 0.07, href: '/fund-7' },
				{ slug: 'fund-8', label: 'Fund 8', name: 'Fund 8', tvl: 30, avgApy: 0.08, href: '/fund-8' },
				{ slug: 'fund-9', label: 'Fund 9', name: 'Fund 9', tvl: 20, avgApy: 0.09, href: '/fund-9' }
			],
			{ groupLabelPlural: 'funds', otherThreshold: 0, maxIndividualSlices: 7 }
		);

		expect(slices.map((slice) => slice.label)).toEqual([
			'Fund 1',
			'Fund 2',
			'Fund 3',
			'Fund 4',
			'Fund 5',
			'Fund 6',
			'Fund 7',
			'Other'
		]);
		expect(slices.at(-1)).toMatchObject({
			label: 'Other',
			name: 'Other funds',
			memberCount: 2,
			tvl: 50
		});
	});
});
