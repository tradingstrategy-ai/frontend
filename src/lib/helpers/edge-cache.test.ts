import { describe, expect, test } from 'vitest';
import { chartDataUrl, stripEdgeCacheExtension } from './edge-cache';

describe('stripEdgeCacheExtension', () => {
	test.each([
		['/top-vaults/chart-data.bin', '/top-vaults/chart-data'],
		['/vaults/protocols/morpho/chart-data.bin', '/vaults/protocols/morpho/chart-data'],
		['/vaults/compare/chart-data.bin', '/vaults/compare/chart-data'],
		[
			'/vaults/9999-0xdfc24b077bc1425ad1dea75bcb6f8158e10df303/metrics.bin',
			'/vaults/9999-0xdfc24b077bc1425ad1dea75bcb6f8158e10df303/metrics'
		],
		['/social-card/trading-strategy.png', '/social-card/trading-strategy'],
		['/social-card/blockchain/ethereum.png', '/social-card/blockchain/ethereum'],
		['/social-card/vault/325-vlt%3Atest.png', '/social-card/vault/325-vlt%3Atest'],
		['/metadata-logo/protocol/morpho.webp', '/metadata-logo/protocol/morpho'],
		['/metadata-logo/stablecoin/usdc.avif', '/metadata-logo/stablecoin/usdc'],
		['/metadata-logo/protocol/morpho.bin', '/metadata-logo/protocol/morpho']
	])('routes %s to %s', (pathname, route) => {
		expect(stripEdgeCacheExtension(pathname)).toBe(route);
	});

	test.each([
		'/vaults/protocols/morpho/chart-data',
		'/vaults/morpho-vault.bin',
		'/glossary/apy.png',
		'/logos/tokens/btc.svg',
		'/metadata-logo/protocol/morpho.png'
	])('leaves %s alone', (pathname) => {
		expect(stripEdgeCacheExtension(pathname)).toBeUndefined();
	});
});

describe('chartDataUrl', () => {
	test('adds the extension before the query string', () => {
		expect(chartDataUrl('/vaults/compare/chart-data?vault=a&vault=b')).toBe(
			'/vaults/compare/chart-data.bin?vault=a&vault=b'
		);
		expect(chartDataUrl('/top-vaults/chart-data')).toBe('/top-vaults/chart-data.bin');
	});
});
