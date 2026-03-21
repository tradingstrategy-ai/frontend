import { describe, expect, test } from 'vitest';
import {
	HISTORICAL_TVL_CHAIN_OUTLIER_THRESHOLD,
	buildHistoricalTvlByChainPayload,
	collapseVaultSnapshotsToWeeklyRows,
	forwardFillWeeklyRows
} from './historical-tvl-chain';

describe('collapseVaultSnapshotsToWeeklyRows', () => {
	test('keeps the latest snapshot for each vault-week bucket', () => {
		const weeklyRows = collapseVaultSnapshotsToWeeklyRows([
			{
				id: 'vault-a',
				chainId: 1,
				timestamp: '2026-03-16T02:00:00Z',
				tvl: 100
			},
			{
				id: 'vault-a',
				chainId: 1,
				timestamp: '2026-03-18T10:00:00Z',
				tvl: 125
			},
			{
				id: 'vault-a',
				chainId: 1,
				timestamp: '2026-03-24T10:00:00Z',
				tvl: 175
			},
			{
				id: 'vault-b',
				chainId: 8453,
				timestamp: '2026-03-20T05:00:00Z',
				tvl: 75
			}
		]);

		expect(weeklyRows).toEqual([
			{
				id: 'vault-a',
				chainId: 1,
				week: '2026-03-16',
				tvl: 125
			},
			{
				id: 'vault-b',
				chainId: 8453,
				week: '2026-03-16',
				tvl: 75
			},
			{
				id: 'vault-a',
				chainId: 1,
				week: '2026-03-23',
				tvl: 175
			}
		]);
	});
});

describe('buildHistoricalTvlByChainPayload', () => {
	test('forward fills sparse weekly vault rows before grouping chain totals', () => {
		const payload = buildHistoricalTvlByChainPayload(
			[
				{ id: 'hyper-core-a', chainId: 9999, week: '2025-10-13', tvl: 300 },
				{ id: 'hyper-core-a', chainId: 9999, week: '2025-10-27', tvl: 330 },
				{ id: 'hyper-core-b', chainId: 9999, week: '2025-10-13', tvl: 120 },
				{ id: 'hyper-core-b', chainId: 9999, week: '2025-10-20', tvl: 130 },
				{ id: 'hyper-core-b', chainId: 9999, week: '2025-10-27', tvl: 140 }
			],
			[
				{ id: 'hyper-core-a', risk_numeric: 20, chain_id: 9999, chain: 'Hyperliquid' },
				{ id: 'hyper-core-b', risk_numeric: 20, chain_id: 9999, chain: 'Hyperliquid' }
			],
			100
		);

		expect(payload.weeks).toEqual(['2025-10-13', '2025-10-20', '2025-10-27']);
		expect(payload.series).toEqual([
			{
				key: 'hyperliquid',
				label: 'Hyperliquid',
				chainIds: [9999],
				values: [420, 430, 470]
			}
		]);
	});

	test('groups by display chain, excludes blacklisted and outlier rows, and preserves unknown chains', () => {
		const payload = buildHistoricalTvlByChainPayload(
			[
				{ id: 'hyper-evm', chainId: 999, week: '2026-03-16', tvl: 100 },
				{ id: 'hyper-core', chainId: 9999, week: '2026-03-16', tvl: 150 },
				{ id: 'hyper-evm', chainId: 999, week: '2026-03-23', tvl: 120 },
				{ id: 'hyper-core', chainId: 9999, week: '2026-03-23', tvl: 200 },
				{ id: 'unknown-good', chainId: 777777, week: '2026-03-23', tvl: 80 },
				{
					id: 'blacklisted',
					chainId: 1,
					week: '2026-03-23',
					tvl: 999
				},
				{
					id: 'outlier',
					chainId: 8453,
					week: '2026-03-23',
					tvl: HISTORICAL_TVL_CHAIN_OUTLIER_THRESHOLD + 1
				}
			],
			[
				{ id: 'hyper-evm', risk_numeric: 20, chain_id: 999, chain: 'Hyperliquid' },
				{ id: 'hyper-core', risk_numeric: 20, chain_id: 9999, chain: 'Hyperliquid' },
				{ id: 'unknown-good', risk_numeric: 20, chain_id: 777777, chain: 'Mystery chain' },
				{ id: 'blacklisted', risk_numeric: 999, chain_id: 1, chain: 'Ethereum' },
				{ id: 'outlier', risk_numeric: 20, chain_id: 8453, chain: 'Base' }
			],
			245.4,
			new Date('2026-03-21T12:00:00Z')
		);

		expect(payload.generatedAt).toBe('2026-03-21T12:00:00.000Z');
		expect(payload.durationMs).toBe(245);
		expect(payload.weeks).toEqual(['2026-03-16', '2026-03-23']);
		expect(payload.series).toEqual([
			{
				key: 'hyperliquid',
				label: 'Hyperliquid',
				chainIds: [999, 9999],
				values: [250, 320]
			},
			{
				key: 'chain-777777',
				label: 'Mystery chain',
				chainIds: [777777],
				values: [0, 80]
			}
		]);
		expect(payload.meta).toEqual({
			rawWeeklyVaultPoints: 7,
			includedVaults: 3,
			excludedBlacklistedVaults: 1,
			excludedOutlierPoints: 1
		});
	});
});

describe('forwardFillWeeklyRows', () => {
	test('carries the latest weekly TVL forward across missing weeks', () => {
		expect(
			forwardFillWeeklyRows([
				{ id: 'vault-a', chainId: 9999, week: '2025-10-13', tvl: 300 },
				{ id: 'vault-a', chainId: 9999, week: '2025-10-27', tvl: 330 },
				{ id: 'vault-b', chainId: 9999, week: '2025-10-20', tvl: 50 }
			])
		).toEqual([
			{ id: 'vault-a', chainId: 9999, week: '2025-10-13', tvl: 300 },
			{ id: 'vault-a', chainId: 9999, week: '2025-10-20', tvl: 300 },
			{ id: 'vault-b', chainId: 9999, week: '2025-10-20', tvl: 50 },
			{ id: 'vault-a', chainId: 9999, week: '2025-10-27', tvl: 330 },
			{ id: 'vault-b', chainId: 9999, week: '2025-10-27', tvl: 50 }
		]);
	});
});
