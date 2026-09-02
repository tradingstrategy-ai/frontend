import { describe, expect, it } from 'vitest';
import type { StrategyInfo } from '../models/strategy-info';
import { compactStrategyTileChartData } from './chart';

function makeStrategy(useSharePrice: boolean): StrategyInfo {
	return {
		useSharePrice,
		summary_statistics: {
			share_price_returns_90_days: [
				[Date.UTC(2026, 0, 1, 10) / 1000, 0],
				[Date.UTC(2026, 0, 1, 16) / 1000, 0.1]
			],
			compounding_unrealised_trading_profitability: [
				[Date.UTC(2026, 0, 1, 10) / 1000, 0],
				[Date.UTC(2026, 0, 1, 16) / 1000, 0.2]
			]
		}
	} as StrategyInfo;
}

describe('compactStrategyTileChartData', () => {
	it('keeps and downsamples only the selected share-price series', () => {
		const compacted = compactStrategyTileChartData(makeStrategy(true));

		expect(compacted.summary_statistics?.share_price_returns_90_days).toEqual([
			[Date.UTC(2025, 11, 31) / 1000, 0],
			[Date.UTC(2026, 0, 1) / 1000, 0.1]
		]);
		expect(compacted.summary_statistics?.compounding_unrealised_trading_profitability).toBeUndefined();
	});

	it('keeps and downsamples only the selected profitability series', () => {
		const compacted = compactStrategyTileChartData(makeStrategy(false));

		expect(compacted.summary_statistics?.compounding_unrealised_trading_profitability).toEqual([
			[Date.UTC(2025, 11, 31) / 1000, 0],
			[Date.UTC(2026, 0, 1) / 1000, 0.2]
		]);
		expect(compacted.summary_statistics?.share_price_returns_90_days).toBeUndefined();
	});

	it('keeps one carry-in sample when limiting the visible chart range', () => {
		const strategy = makeStrategy(true);
		strategy.summary_statistics!.share_price_returns_90_days = [
			[Date.UTC(2026, 0, 1, 16) / 1000, 0.1],
			[Date.UTC(2026, 0, 2, 16) / 1000, 0.2],
			[Date.UTC(2026, 0, 3, 16) / 1000, 0.3]
		];

		const compacted = compactStrategyTileChartData(strategy, new Date(Date.UTC(2026, 0, 3)));

		expect(compacted.summary_statistics?.share_price_returns_90_days).toEqual([
			[Date.UTC(2026, 0, 2) / 1000, 0.2],
			[Date.UTC(2026, 0, 3) / 1000, 0.3]
		]);
	});
});
