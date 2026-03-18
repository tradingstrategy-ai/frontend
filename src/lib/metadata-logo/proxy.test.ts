import { describe, expect, test } from 'vitest';
import {
	buildMetadataLogoProxyPath,
	getDefaultMetadataLogoQuality,
	getMetadataLogoCacheControl,
	parseMetadataLogoDimension,
	parseMetadataLogoFormat,
	parseMetadataLogoQuality
} from './proxy';

describe('metadata logo proxy helpers', () => {
	test('builds proxied stablecoin URLs with default format parameters', () => {
		expect(buildMetadataLogoProxyPath('stablecoin', 'usdc', { format: 'webp' })).toBe(
			'/metadata-logo/stablecoin/usdc?format=webp'
		);
	});

	test('builds proxied protocol URLs with transform parameters', () => {
		expect(
			buildMetadataLogoProxyPath('protocol', 'lagoon-finance', {
				format: 'avif',
				width: 96,
				height: 96,
				quality: 61,
				version: '2026-03-18'
			})
		).toBe('/metadata-logo/protocol/lagoon-finance?format=avif&w=96&h=96&q=61&v=2026-03-18');
	});

	test('parses supported formats only', () => {
		expect(parseMetadataLogoFormat('webp')).toBe('webp');
		expect(parseMetadataLogoFormat('avif')).toBe('avif');
		expect(parseMetadataLogoFormat('png')).toBeUndefined();
	});

	test('caps dimensions and quality at safe limits', () => {
		expect(parseMetadataLogoDimension('4096')).toBe(1024);
		expect(parseMetadataLogoQuality('120', 'webp')).toBe(100);
	});

	test('uses format-specific default quality values', () => {
		expect(getDefaultMetadataLogoQuality('webp')).toBe(72);
		expect(getDefaultMetadataLogoQuality('avif')).toBe(58);
		expect(parseMetadataLogoQuality(null, 'avif')).toBe(58);
	});

	test('uses immutable caching for versioned requests', () => {
		expect(getMetadataLogoCacheControl('v1')).toContain('immutable');
		expect(getMetadataLogoCacheControl(null)).toContain('stale-while-revalidate');
	});
});
