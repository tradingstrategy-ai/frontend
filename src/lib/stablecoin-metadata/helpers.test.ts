import { describe, expect, test } from 'vitest';
import {
	buildStablecoinMetadataLookup,
	findStablecoinMetadata,
	formatStablecoinDisplayName,
	getStablecoinCoingeckoLink,
	getStablecoinNativeRate,
	isStablecoinDepegged,
	resolveStablecoinSlug
} from './helpers';
import type { StablecoinMetadata } from './schemas';

const metadataIndex: StablecoinMetadata[] = [
	{
		symbol: 'USD+',
		slug: 'usd-plus',
		name: 'USD+ (Overnight Finance)',
		short_description: 'Test',
		long_description: 'Test',
		description: 'Test',
		category: 'stablecoin',
		links: {
			homepage: null,
			coingecko: null,
			defillama: null,
			twitter: null
		},
		logos: {
			light: 'https://example.com/usd-plus.png'
		}
	}
];

describe('stablecoin metadata helpers', () => {
	test('matches metadata by symbol when plus signs are present', () => {
		const lookup = buildStablecoinMetadataLookup(metadataIndex);
		const metadata = findStablecoinMetadata(lookup, 'USD+');

		expect(metadata?.slug).toBe('usd-plus');
	});

	test('resolves canonical slug for vault denominations with plus signs', () => {
		const lookup = buildStablecoinMetadataLookup(metadataIndex);
		const slug = resolveStablecoinSlug(
			{
				slug: 'usd',
				symbol: 'USD+',
				name: 'USD+ (Overnight Finance)'
			},
			lookup
		);

		expect(slug).toBe('usd-plus');
	});

	test('falls back to plus-aware slug generation without metadata', () => {
		const slug = resolveStablecoinSlug({
			slug: 'usd',
			symbol: 'USD+'
		});

		expect(slug).toBe('usd-plus');
	});

	test('uses punctuation as word separators for fallback slugs', () => {
		const slug = resolveStablecoinSlug({
			symbol: 'USD (offchain)'
		});

		expect(slug).toBe('usd-offchain');
	});

	test('appends symbol to display name when missing', () => {
		expect(formatStablecoinDisplayName('USD Coin (Circle)', 'USDC')).toBe('USD Coin (Circle) USDC');
	});

	test('does not append symbol when already present in display name', () => {
		expect(formatStablecoinDisplayName('USD Coin (USDC)', 'USDC')).toBe('USD Coin (USDC)');
	});

	test('uses top-level CoinGecko link before legacy nested link', () => {
		expect(
			getStablecoinCoingeckoLink({
				coingecko_link: 'https://www.coingecko.com/en/coins/usd-coin',
				links: { coingecko: 'https://old.example/usdc' }
			})
		).toBe('https://www.coingecko.com/en/coins/usd-coin');
	});

	test('uses native peg-currency rate for depeg detection', () => {
		expect(isStablecoinDepegged({ usd_rate: 1.12, peg_rate: 0.89, peg_rate_currency: 'eur' })).toBe(true);
		expect(isStablecoinDepegged({ usd_rate: 1.12, peg_rate: 0.9, peg_rate_currency: 'eur' })).toBe(false);
		expect(isStablecoinDepegged({ usd_rate: 1.12, peg_rate: 0.99, peg_rate_currency: 'eur' })).toBe(false);
	});

	test('does not mark stablecoins above peg as depegged', () => {
		expect(isStablecoinDepegged({ usd_rate: 1.11, peg_rate: 1.11, peg_rate_currency: 'usd' })).toBe(false);
	});

	test('uses vault denomination native rate for depeg detection', () => {
		expect(
			isStablecoinDepegged({
				denomination_token_rate: {
					usd_rate: 1.14,
					native_rate: 0.89,
					native_rate_currency: 'eur'
				}
			})
		).toBe(true);
		expect(
			isStablecoinDepegged({
				denomination_token_rate: {
					usd_rate: 1.14,
					native_rate: 0.99,
					native_rate_currency: 'eur'
				}
			})
		).toBe(false);
	});

	test('uses USD rate as native rate for USD-pegged vault entries', () => {
		expect(getStablecoinNativeRate({ denomination_token_rate: { usd_rate: 0.89 } })).toBe(0.89);
		expect(isStablecoinDepegged({ denomination_token_rate: { usd_rate: 0.89 } })).toBe(true);
	});

	test('does not use USD fallback when a non-USD native currency is known', () => {
		expect(getStablecoinNativeRate({ usd_rate: 0.7, peg_rate_currency: 'eur' })).toBeUndefined();
		expect(isStablecoinDepegged({ usd_rate: 0.7, peg_rate_currency: 'eur' })).toBe(false);
	});

	test('treats explicit depeg timestamp as depegged only when no rate is available', () => {
		expect(isStablecoinDepegged({ depegged_at: '2026-06-26T12:15:26' })).toBe(true);
		expect(isStablecoinDepegged({ peg_rate: 0.99, peg_rate_currency: 'usd', depegged_at: '2026-06-26T12:15:26' })).toBe(
			false
		);
	});
});
