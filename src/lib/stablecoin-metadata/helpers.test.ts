import { describe, expect, test } from 'vitest';
import { buildStablecoinMetadataLookup, findStablecoinMetadata, resolveStablecoinSlug } from './helpers';
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
});
