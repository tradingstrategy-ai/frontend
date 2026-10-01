import { describe, expect, test } from 'vitest';
import type { DenominationTokenRate } from '$lib/top-vaults/schemas';
import { buildCurrentAssetTypeTvlSnapshot } from './historical-tvl-asset-type';
import {
	buildHistoricalTvlByAssetTypePayload,
	buildHistoricalTvlByChainPayload,
	HISTORICAL_TVL_OUTLIER_THRESHOLD
} from './historical-tvl';

function metadata(id: string, flags: string[] = [], risk_numeric = 20) {
	return {
		id,
		flags,
		risk_numeric,
		chain_id: 1,
		chain: 'Ethereum',
		denomination: 'USDC',
		normalised_denomination: 'USD Coin',
		denomination_slug: 'usdc',
		protocol: 'Unknown',
		protocol_slug: 'unknown'
	};
}

function usdRate(rate: number | null): DenominationTokenRate {
	return {
		coingecko_id: null,
		source_currency: 'eur',
		usd_rate: rate,
		usd_rate_fetched_at: null,
		usd_rate_source: 'test',
		native_rate: null,
		native_rate_currency: null,
		native_rate_fetched_at: null,
		native_rate_source: null,
		source_currency_usd_rate: null,
		source_currency_usd_rate_fetched_at: null,
		source_currency_usd_rate_source: null
	};
}

describe('buildHistoricalTvlByAssetTypePayload', () => {
	test.each([
		['2026-03-16', '2026-03-23', '2026-03-30'],
		['2026-03-16', '2026-03-17', '2026-03-18']
	])('splits TVL by the fund flag and preserves total TVL with sparse observations (%s)', (first, middle, last) => {
		const vaults = [
			metadata('fund', ['tokenised_fund', 'other']),
			metadata('vault'),
			metadata('pool', ['amm']),
			metadata('blacklisted-fund', ['tokenised_fund'], 999)
		];
		const rows = [
			{ id: 'fund', chainId: 1, week: first, tvl: 100 },
			{ id: 'fund', chainId: 1, week: last, tvl: 0 },
			{ id: 'vault', chainId: 1, week: first, tvl: 80 },
			{ id: 'vault', chainId: 1, week: middle, tvl: 90 },
			{ id: 'pool', chainId: 1, week: middle, tvl: 30 },
			{ id: 'blacklisted-fund', chainId: 1, week: first, tvl: 200 },
			{ id: 'fund', chainId: 1, week: middle, tvl: HISTORICAL_TVL_OUTLIER_THRESHOLD + 1 },
			{ id: 'pool', chainId: 1, week: last, tvl: -1 },
			{ id: 'vault', chainId: 1, week: last, tvl: NaN },
			{ id: 'missing-metadata', chainId: 1, week: last, tvl: 500 }
		];
		const payload = buildHistoricalTvlByAssetTypePayload(rows, vaults, 42.3, new Date('2026-04-01T00:00:00Z'));

		expect(payload.weeks).toEqual([first, middle, last]);
		expect(payload.series).toEqual([
			{ key: 'tokenised-funds', label: 'Tokenised funds', values: [100, 100, 0] },
			{ key: 'vaults', label: 'Vaults', values: [80, 120, 120] }
		]);
		expect(payload.meta).toEqual({
			rawWeeklyVaultPoints: rows.length,
			includedVaults: 3,
			excludedBlacklistedVaults: 1,
			excludedOutlierPoints: 1
		});
		expect(payload.generatedAt).toBe('2026-04-01T00:00:00.000Z');
		expect(payload.durationMs).toBe(42);
		const chainPayload = buildHistoricalTvlByChainPayload(rows, vaults, 0);
		for (const [index] of payload.weeks.entries()) {
			expect(payload.series.reduce((sum, series) => sum + series.values[index], 0)).toBe(
				chainPayload.series.reduce((sum, series) => sum + series.values[index], 0)
			);
		}
	});

	test.each([{ flags: [] }, { flags: ['tokenised_fund'] }])(
		'keeps both categories when only one has TVL ($flags)',
		({ flags }) => {
			const payload = buildHistoricalTvlByAssetTypePayload(
				[{ id: 'asset', chainId: 1, week: '2026-03-16', tvl: 100 }],
				[metadata('asset', flags)],
				0
			);
			expect(payload.series.map((series) => series.values)).toEqual(flags.length ? [[100], [0]] : [[0], [100]]);
		}
	);

	test('converts historical denomination balances to USD and excludes unpriced non-USD assets', () => {
		const vaults = [
			{ ...metadata('fund', ['tokenised_fund']), denomination_token_rate: usdRate(1.2) },
			{ ...metadata('euro-vault'), denomination_token_rate: usdRate(1.2) },
			{ ...metadata('unpriced'), denomination_token_rate: usdRate(null) }
		];
		const rows = vaults.map((vault) => ({ id: vault.id, chainId: 1, week: '2026-09-21', tvl: 100 }));
		const payload = buildHistoricalTvlByAssetTypePayload(rows, vaults, 0);
		expect(payload.series.map((series) => series.values)).toEqual([[120], [120]]);
		expect(payload.meta.includedVaults).toBe(2);
		expect(buildHistoricalTvlByChainPayload(rows, vaults, 0).series[0].values).toEqual([240]);
	});

	test('returns no series when no eligible historical data is available', () => {
		const payload = buildHistoricalTvlByAssetTypePayload([], [metadata('fund', ['tokenised_fund'])], 0);
		expect(payload.weeks).toEqual([]);
		expect(payload.series).toEqual([]);
	});
});

describe('buildCurrentAssetTypeTvlSnapshot', () => {
	test('converts current NAV using the source USD rate and excludes missing foreign currency rates', () => {
		const snapshot = buildCurrentAssetTypeTvlSnapshot(
			[
				{ flags: ['tokenised_fund'], risk_numeric: 20, current_nav: 100, denomination_token_rate: usdRate(1.2) },
				{ flags: [], risk_numeric: 20, current_nav: 100, denomination_token_rate: usdRate(null) }
			],
			'2026-10-01T09:17:42Z'
		);
		expect(snapshot.totalTvl).toBe(120);
		expect(snapshot.series.map((series) => series.tvl)).toEqual([120, 0]);
	});

	test('uses reported current NAV in USD, rather than historical averages, with the same exclusions', () => {
		const vaults = [
			{ flags: ['tokenised_fund'], risk_numeric: 20, current_nav: 100, denomination_token_rate: null },
			{ flags: [], risk_numeric: null, current_nav: 200, denomination_token_rate: null },
			{ flags: ['tokenised_fund'], risk_numeric: 999, current_nav: 500, denomination_token_rate: null },
			{ flags: [], risk_numeric: 20, current_nav: null, denomination_token_rate: null },
			{ flags: [], risk_numeric: 20, current_nav: -10, denomination_token_rate: null },
			{ flags: [], risk_numeric: 20, current_nav: Infinity, denomination_token_rate: null },
			{ flags: [], risk_numeric: 20, current_nav: HISTORICAL_TVL_OUTLIER_THRESHOLD + 1, denomination_token_rate: null }
		];
		const snapshot = buildCurrentAssetTypeTvlSnapshot(vaults, '2026-10-01T09:17:42Z');
		expect(snapshot).toEqual({
			asOf: '2026-10-01T09:17:42.000Z',
			totalTvl: 300,
			series: [
				{ key: 'tokenised-funds', label: 'Tokenised funds', tvl: 100, vaultCount: 1 },
				{ key: 'vaults', label: 'Vaults', tvl: 200, vaultCount: 1 }
			]
		});
	});
});
