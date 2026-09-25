import { describe, expect, it } from 'vitest';
import {
	INDEXABLE_MIN_LIQUIDITY_USD,
	INDEXABLE_MIN_VOLUME_USD,
	hasBlockedName,
	isPairIndexable,
	isTokenIndexable,
	isVaultIndexable
} from './indexing';

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

describe('hasBlockedName', () => {
	it('matches adult and gambling terms in any position', () => {
		expect(hasBlockedName(['PornForce'])).toBe(true);
		expect(hasBlockedName(['Nude AI'])).toBe(true);
		expect(hasBlockedName(['xXx Token'])).toBe(true);
		expect(hasBlockedName(['CasinoCoin'])).toBe(true);
		expect(hasBlockedName(['SexyToken'])).toBe(true);
	});

	it('treats hyphens, underscores and slashes as word separators', () => {
		expect(hasBlockedName(['PORNHUB-ETH'])).toBe(true);
		expect(hasBlockedName(['XXX-BNB'])).toBe(true);
		expect(hasBlockedName(['BET-USDT'])).toBe(true);
		expect(hasBlockedName(['CUM/WETH'])).toBe(true);
		expect(hasBlockedName(['slot_machine'])).toBe(true);
		// gambling brand fused into one word; `New Bet` is already caught by the whole-word `bet`
		expect(hasBlockedName(['NewBet'])).toBe(true);
		expect(hasBlockedName(['newbet'])).toBe(true);
		expect(hasBlockedName(['New Bet'])).toBe(true);
	});

	it('strips diacritics before matching', () => {
		expect(hasBlockedName(['Pörn'])).toBe(true);
	});

	it('does not match legitimate names that contain short blocked words', () => {
		for (const name of [
			'USDT',
			'Alphabet',
			'Super AI',
			'ZEUS',
			'Longinus',
			'QQ4',
			'Analytics DAO',
			'888',
			'Essex',
			'Peacock',
			'Betelgeuse',
			'Cumulus',
			'Slotted',
			'Analysis',
			'Beta',
			'Better yield',
			'Newbeta Fund'
		]) {
			expect(hasBlockedName([name]), name).toBe(false);
		}
	});

	it('skips missing names', () => {
		expect(hasBlockedName([null, undefined, ''])).toBe(false);
	});
});

describe('name blocklist on indexable pages', () => {
	it('keeps liquid tokens with blocked names out of the index', () => {
		// the four pages that survived the liquidity thresholds in the 2026-09-16 audit
		expect(isTokenIndexable({ name: 'PornForce', symbol: 'PORNFORCE', liquidity_latest: 225_000 })).toBe(false);
		expect(isTokenIndexable({ name: 'Nude AI', symbol: 'NUDE', liquidity_latest: 115_000 })).toBe(false);
		expect(isPairIndexable({ pair_symbol: 'PORNHUB-ETH', pair_tvl: 53_000 })).toBe(false);
		expect(isPairIndexable({ pair_symbol: 'XXX-BNB', base_token_symbol: 'XXX', pair_tvl: 9_000 })).toBe(false);
	});

	it('still indexes liquid tokens and pairs with ordinary names', () => {
		expect(isTokenIndexable({ name: 'Tether USD', symbol: 'USDT', liquidity_latest: 1_000_000 })).toBe(true);
		expect(isPairIndexable({ pair_symbol: 'ZEUS-WETH', pair_name: 'Zeus - Wrapped Ether', pair_tvl: 50_000 })).toBe(
			true
		);
	});
});

describe('isVaultIndexable', () => {
	const live = { name: 'Steakhouse USDC', current_tvl_usd: 800_000, peak_tvl_usd: 900_000 };

	it('indexes vaults with TVL at or above the threshold', () => {
		expect(isVaultIndexable(live)).toBe(true);
		expect(isVaultIndexable({ name: 'Edge', current_tvl_usd: INDEXABLE_MIN_LIQUIDITY_USD, peak_tvl_usd: 0 })).toBe(
			true
		);
	});

	it('does not index vaults confirmed below the threshold now and at their peak', () => {
		expect(isVaultIndexable({ name: 'Dust', current_tvl_usd: 0, peak_tvl_usd: 0 })).toBe(false);
		expect(
			isVaultIndexable({
				name: 'Dust',
				current_tvl_usd: INDEXABLE_MIN_LIQUIDITY_USD - 1,
				peak_tvl_usd: INDEXABLE_MIN_LIQUIDITY_USD - 1
			})
		).toBe(false);
	});

	it('keeps vaults that once held real money', () => {
		expect(isVaultIndexable({ name: 'Wound down', current_tvl_usd: 12, peak_tvl_usd: 2_000_000 })).toBe(true);
	});

	it('treats missing TVL as unknown and keeps the page indexable', () => {
		expect(isVaultIndexable({ name: 'No data' })).toBe(true);
		expect(isVaultIndexable({ name: 'No rate', current_tvl_usd: null, peak_tvl_usd: null })).toBe(true);
		expect(isVaultIndexable({ name: 'Low now, unknown peak', current_tvl_usd: 1, peak_tvl_usd: null })).toBe(true);
		expect(isVaultIndexable({ name: 'Unknown now, low peak', current_tvl_usd: null, peak_tvl_usd: 1 })).toBe(true);
	});

	it('excludes unknown-protocol vaults unless they hold real TVL now', () => {
		expect(isVaultIndexable({ ...live, unknown_protocol: true })).toBe(true);
		expect(
			isVaultIndexable({ name: 'Mystery', current_tvl_usd: 1, peak_tvl_usd: 1_000_000, unknown_protocol: true })
		).toBe(false);
		expect(isVaultIndexable({ name: 'Mystery', unknown_protocol: true })).toBe(false);
	});

	it('does not index the NewBet vault despite its TVL', () => {
		expect(isVaultIndexable({ ...live, name: 'NewBet' })).toBe(false);
	});

	it('never indexes blacklisted, unnamed or blocklisted vaults', () => {
		expect(isVaultIndexable({ ...live, blacklisted: true })).toBe(false);
		expect(isVaultIndexable({ ...live, name: '<unnamed>' })).toBe(false);
		expect(isVaultIndexable({ ...live, name: '' })).toBe(false);
		expect(isVaultIndexable({ ...live, name: null })).toBe(false);
		expect(isVaultIndexable({ ...live, name: 'Casino Yield' })).toBe(false);
	});
});
