import { describe, expect, test } from 'vitest';
import { HISTORICAL_TVL_CHAIN_OUTLIER_THRESHOLD } from './historical-tvl-chain';
import {
	buildHistoricalTvlByProtocolPayload,
	buildHistoricalTvlByStablecoinPayload,
	buildHistoricalTvlByChainPayload,
	collapseVaultSnapshotsToWeeklyRows,
	forwardFillWeeklyRows
} from './historical-tvl';

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

/** Minimal vault metadata for the chain grouping; the other fields are irrelevant here. */
function chainMeta(id: string, chain_id: number, chain: string, risk_numeric = 20) {
	return {
		id,
		risk_numeric,
		chain_id,
		chain,
		denomination: 'USDC',
		normalised_denomination: 'USDC',
		denomination_slug: 'usdc',
		protocol: 'Test',
		protocol_slug: 'test'
	};
}

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
			[chainMeta('hyper-core-a', 9999, 'Hyperliquid', 20), chainMeta('hyper-core-b', 9999, 'Hyperliquid', 20)],
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
				chainMeta('hyper-evm', 999, 'Hyperliquid', 20),
				chainMeta('hyper-core', 9999, 'Hyperliquid', 20),
				chainMeta('unknown-good', 777777, 'Mystery chain', 20),
				chainMeta('blacklisted', 1, 'Ethereum', 999),
				chainMeta('outlier', 8453, 'Base', 20)
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

describe('buildHistoricalTvlByStablecoinPayload', () => {
	test('groups vault TVL by stablecoin slug and label', () => {
		const payload = buildHistoricalTvlByStablecoinPayload(
			[
				{ id: 'usdc-a', chainId: 1, week: '2026-03-16', tvl: 100 },
				{ id: 'usdc-b', chainId: 8453, week: '2026-03-16', tvl: 80 },
				{ id: 'dai-a', chainId: 1, week: '2026-03-16', tvl: 50 }
			],
			[
				{
					id: 'usdc-a',
					risk_numeric: 20,
					chain_id: 1,
					chain: 'Ethereum',
					denomination: 'USDC',
					normalised_denomination: 'USD Coin',
					denomination_slug: 'usdc',
					protocol: 'Aave',
					protocol_slug: 'aave'
				},
				{
					id: 'usdc-b',
					risk_numeric: 20,
					chain_id: 8453,
					chain: 'Base',
					denomination: 'USDC.e',
					normalised_denomination: 'USD Coin',
					denomination_slug: 'usdc',
					protocol: 'Morpho',
					protocol_slug: 'morpho'
				},
				{
					id: 'dai-a',
					risk_numeric: 20,
					chain_id: 1,
					chain: 'Ethereum',
					denomination: 'DAI',
					normalised_denomination: 'Dai',
					denomination_slug: 'dai',
					protocol: 'Maker',
					protocol_slug: 'maker'
				}
			],
			175.6,
			new Date('2026-03-21T12:00:00Z')
		);

		expect(payload.generatedAt).toBe('2026-03-21T12:00:00.000Z');
		expect(payload.durationMs).toBe(176);
		expect(payload.series).toEqual([
			{
				key: 'usdc',
				label: 'USD Coin',
				stablecoinSlug: 'usdc',
				values: [180]
			},
			{
				key: 'dai',
				label: 'Dai',
				stablecoinSlug: 'dai',
				values: [50]
			}
		]);
	});
});

describe('buildHistoricalTvlByProtocolPayload', () => {
	test('groups vault TVL by protocol slug with protocol display names', () => {
		const payload = buildHistoricalTvlByProtocolPayload(
			[
				{ id: 'aave-a', chainId: 1, week: '2026-03-16', tvl: 100 },
				{ id: 'aave-b', chainId: 8453, week: '2026-03-16', tvl: 90 },
				{ id: 'yearn-a', chainId: 1, week: '2026-03-16', tvl: 70 }
			],
			[
				{
					id: 'aave-a',
					risk_numeric: 20,
					chain_id: 1,
					chain: 'Ethereum',
					denomination: 'USDC',
					normalised_denomination: 'USD Coin',
					denomination_slug: 'usdc',
					protocol: 'Aave',
					protocol_slug: 'aave'
				},
				{
					id: 'aave-b',
					risk_numeric: 20,
					chain_id: 8453,
					chain: 'Base',
					denomination: 'USDC',
					normalised_denomination: 'USD Coin',
					denomination_slug: 'usdc',
					protocol: 'Aave',
					protocol_slug: 'aave'
				},
				{
					id: 'yearn-a',
					risk_numeric: 20,
					chain_id: 1,
					chain: 'Ethereum',
					denomination: 'DAI',
					normalised_denomination: 'Dai',
					denomination_slug: 'dai',
					protocol: 'Yearn',
					protocol_slug: 'yearn'
				}
			],
			88
		);

		expect(payload.series).toEqual([
			{
				key: 'aave',
				label: 'Aave',
				protocolSlug: 'aave',
				values: [190]
			},
			{
				key: 'yearn',
				label: 'Yearn',
				protocolSlug: 'yearn',
				values: [70]
			}
		]);
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
