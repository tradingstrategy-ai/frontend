import { describe, expect, it } from 'vitest';
import { INDEXABLE_MIN_LIQUIDITY_USD, INDEXABLE_MIN_VOLUME_USD, isPairIndexable, isTokenIndexable } from './indexing';

describe('isTokenIndexable', () => {
	it('indexes tokens with liquidity at or above the threshold', () => {
		expect(isTokenIndexable({ liquidity_latest: INDEXABLE_MIN_LIQUIDITY_USD, volume_24h: 0 })).toBe(true);
		expect(isTokenIndexable({ liquidity_latest: 633_081_719, volume_24h: 829_720_210 })).toBe(true);
	});

	it('indexes tokens with volume at or above the threshold even with no liquidity', () => {
		expect(isTokenIndexable({ liquidity_latest: 0, volume_24h: INDEXABLE_MIN_VOLUME_USD })).toBe(true);
	});

	it('uses tvl_latest when it is the larger liquidity signal', () => {
		expect(isTokenIndexable({ liquidity_latest: 10, tvl_latest: 20_000, volume_24h: 0 })).toBe(true);
	});

	it('does not index tokens confirmed below both thresholds', () => {
		// the EverPorn-style case from the 2026-09-16 audit: $0.97 liquidity, zero volume
		expect(isTokenIndexable({ liquidity_latest: 0.97, tvl_latest: 0.97, volume_24h: 0 })).toBe(false);
		expect(
			isTokenIndexable({ liquidity_latest: INDEXABLE_MIN_LIQUIDITY_USD - 1, volume_24h: INDEXABLE_MIN_VOLUME_USD - 1 })
		).toBe(false);
	});

	it('treats missing data as unknown and keeps the page indexable', () => {
		expect(isTokenIndexable({})).toBe(true);
		expect(isTokenIndexable({ liquidity_latest: null, tvl_latest: undefined, volume_24h: null })).toBe(true);
		expect(isTokenIndexable({ liquidity_latest: Number.NaN })).toBe(true);
	});

	it('uses the known metric when only some metrics are missing', () => {
		expect(isTokenIndexable({ liquidity_latest: null, volume_24h: 5 })).toBe(false);
		expect(isTokenIndexable({ liquidity_latest: null, volume_24h: 5_000 })).toBe(true);
		expect(isTokenIndexable({ liquidity_latest: 3, volume_24h: undefined })).toBe(false);
	});
});

describe('isPairIndexable', () => {
	it('indexes pairs with TVL, liquidity or 30-day volume above the thresholds', () => {
		expect(isPairIndexable({ pair_tvl: 96_227_200, usd_liquidity_latest: 48_113_600, usd_volume_30d: 325_974 })).toBe(
			true
		);
		expect(isPairIndexable({ pair_tvl: 0, usd_liquidity_latest: INDEXABLE_MIN_LIQUIDITY_USD, usd_volume_30d: 0 })).toBe(
			true
		);
		expect(isPairIndexable({ pair_tvl: 0, usd_liquidity_latest: 0, usd_volume_30d: INDEXABLE_MIN_VOLUME_USD })).toBe(
			true
		);
	});

	it('does not index pairs confirmed below both thresholds', () => {
		expect(isPairIndexable({ pair_tvl: 0.016, usd_liquidity_latest: null, usd_volume_30d: 0 })).toBe(false);
	});

	it('treats missing data as unknown and keeps the page indexable', () => {
		expect(isPairIndexable({})).toBe(true);
		expect(isPairIndexable({ pair_tvl: null, usd_liquidity_latest: null, usd_volume_30d: undefined })).toBe(true);
	});
});
