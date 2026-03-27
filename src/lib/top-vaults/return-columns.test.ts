import { describe, expect, test } from 'vitest';
import {
	DEFAULT_RETURN_COLUMN_IDS,
	canonicaliseReturnSortKey,
	compareVaultsByReturn,
	getEffectiveReturnValue,
	getReturnColumnValues,
	sanitiseReturnColumnSelection,
	serialiseReturnColumnSelection,
	toggleReturnColumnSelection
} from './return-columns';
import { createTestVault } from './test-utils';

const periodResults = [
	{
		period: '6m',
		error_reason: null,
		period_start_at: '2025-07-01T00:00:00',
		period_end_at: '2026-01-01T00:00:00',
		share_price_start: 1,
		share_price_end: 1.12,
		raw_samples: 4320,
		samples_start_at: '2025-07-01T00:00:00',
		samples_end_at: '2026-01-01T00:00:00',
		daily_samples: 180,
		returns_gross: 0.14,
		returns_net: 0.12,
		cagr_gross: 0.29,
		cagr_net: 0.24,
		volatility: 0.1,
		sharpe: 1.1,
		max_drawdown: -0.02,
		tvl_start: 100_000,
		tvl_end: 120_000,
		tvl_low: 90_000,
		tvl_high: 140_000,
		ranking_overall: 1,
		ranking_chain: 1,
		ranking_protocol: 1
	},
	{
		period: '1y',
		error_reason: null,
		period_start_at: '2025-01-01T00:00:00',
		period_end_at: '2026-01-01T00:00:00',
		share_price_start: 1,
		share_price_end: 1.21,
		raw_samples: 8760,
		samples_start_at: '2025-01-01T00:00:00',
		samples_end_at: '2026-01-01T00:00:00',
		daily_samples: 365,
		returns_gross: 0.24,
		returns_net: 0.21,
		cagr_gross: 0.24,
		cagr_net: 0.21,
		volatility: 0.12,
		sharpe: 1.4,
		max_drawdown: -0.03,
		tvl_start: 80_000,
		tvl_end: 120_000,
		tvl_low: 70_000,
		tvl_high: 140_000,
		ranking_overall: 1,
		ranking_chain: 1,
		ranking_protocol: 1
	}
];

describe('sanitiseReturnColumnSelection', () => {
	test('falls back to defaults when value is missing', () => {
		expect(sanitiseReturnColumnSelection(null)).toEqual(DEFAULT_RETURN_COLUMN_IDS);
	});

	test('keeps empty selection when explicitly encoded in the URL', () => {
		expect(sanitiseReturnColumnSelection('')).toEqual([]);
	});

	test('deduplicates invalid values and caps the result at three entries', () => {
		expect(sanitiseReturnColumnSelection('1m-ann,3m-ann,1m-ann,invalid,6m-abs,1y-ann')).toEqual([
			'1m-ann',
			'3m-ann',
			'6m-abs'
		]);
	});

	test('falls back to defaults when the encoded selection has no valid values', () => {
		expect(sanitiseReturnColumnSelection('not-a-column')).toEqual(DEFAULT_RETURN_COLUMN_IDS);
	});
});

describe('toggleReturnColumnSelection', () => {
	test('removes an existing selection while preserving order', () => {
		expect(toggleReturnColumnSelection(['1m-ann', '3m-ann', 'lifetime-abs'], '3m-ann')).toEqual([
			'1m-ann',
			'lifetime-abs'
		]);
	});

	test('appends new selections until three columns are present', () => {
		expect(toggleReturnColumnSelection(['1m-ann', '3m-ann'], '6m-ann')).toEqual(['1m-ann', '3m-ann', '6m-ann']);
	});

	test('evicts the current third selection when adding a fourth column', () => {
		expect(toggleReturnColumnSelection(['1m-ann', '3m-ann', 'lifetime-abs'], '6m-ann')).toEqual([
			'1m-ann',
			'3m-ann',
			'6m-ann'
		]);
	});
});

describe('return metric extraction', () => {
	const vault = createTestVault('Metrics vault', {
		one_month_returns: 0.04,
		one_month_returns_net: 0.03,
		one_month_cagr: 0.5,
		one_month_cagr_net: 0.4,
		three_months_returns: 0.09,
		three_months_returns_net: 0.08,
		three_months_cagr: 0.31,
		three_months_cagr_net: 0.27,
		cagr: 0.18,
		cagr_net: 0.15,
		lifetime_return: 0.33,
		lifetime_return_net: 0.3,
		period_results: periodResults
	});

	test('returns net-over-gross values for top-level metrics', () => {
		expect(getReturnColumnValues(vault, '1m-ann')).toEqual({ net: 0.4, gross: 0.5 });
		expect(getEffectiveReturnValue(vault, '3m-abs')).toBe(0.08);
		expect(getEffectiveReturnValue(vault, 'lifetime-abs')).toBe(0.3);
	});

	test('returns net-over-gross values for period_results metrics', () => {
		expect(getReturnColumnValues(vault, '6m-ann')).toEqual({ net: 0.24, gross: 0.29 });
		expect(getReturnColumnValues(vault, '1y-abs')).toEqual({ net: 0.21, gross: 0.24 });
	});

	test('falls back to gross values when net values are missing', () => {
		const grossOnlyVault = createTestVault('Gross only vault', {
			period_results: periodResults.map((result) => ({
				...result,
				returns_net: null,
				cagr_net: null
			})),
			one_month_cagr_net: null,
			one_month_cagr: 0.25
		});

		expect(getEffectiveReturnValue(grossOnlyVault, '1m-ann')).toBe(0.25);
		expect(getEffectiveReturnValue(grossOnlyVault, '6m-ann')).toBe(0.29);
		expect(getEffectiveReturnValue(grossOnlyVault, '1y-abs')).toBe(0.24);
	});
});

describe('return sort helpers', () => {
	test('serialises selected columns in order', () => {
		expect(serialiseReturnColumnSelection(['1m-ann', '6m-ann', 'lifetime-abs'])).toBe('1m-ann,6m-ann,lifetime-abs');
	});

	test('canonicalises legacy return sort keys', () => {
		expect(canonicaliseReturnSortKey('one_month_return_ann')).toBe('1m-ann');
		expect(canonicaliseReturnSortKey('lifetime_return')).toBe('lifetime-ann');
	});

	test('compares vaults using the effective displayed value', () => {
		const lowVault = createTestVault('Low vault', { one_month_cagr: 0.1, one_month_cagr_net: null });
		const highVault = createTestVault('High vault', { one_month_cagr: 0.3, one_month_cagr_net: 0.2 });
		expect(compareVaultsByReturn('1m-ann')(lowVault, highVault)).toBeLessThan(0);
	});
});
