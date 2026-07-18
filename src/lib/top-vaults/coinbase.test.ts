import { describe, expect, test, vi } from 'vitest';
import { fetchCoinbaseBenchmarkCloses, getCoinbaseGranularitySeconds } from './coinbase';

function makeProxyFetch(responseData: [number, number][]) {
	return vi.fn(async (input: RequestInfo | URL) => {
		return new Response(JSON.stringify(responseData), { status: 200 });
	}) as unknown as Fetch;
}

describe('getCoinbaseGranularitySeconds', () => {
	test('selects the coarsest Coinbase granularity with roughly 100 or more points', () => {
		expect(getCoinbaseGranularitySeconds(new Date('2025-01-01T00:00:00Z'), new Date('2025-01-08T00:00:00Z'))).toBe(
			3_600
		);
		expect(getCoinbaseGranularitySeconds(new Date('2025-01-01T00:00:00Z'), new Date('2025-01-31T00:00:00Z'))).toBe(
			21_600
		);
		expect(getCoinbaseGranularitySeconds(new Date('2025-01-01T00:00:00Z'), new Date('2025-04-01T00:00:00Z'))).toBe(
			21_600
		);
		expect(getCoinbaseGranularitySeconds(new Date('2025-01-01T00:00:00Z'), new Date('2026-01-01T00:00:00Z'))).toBe(
			86_400
		);
	});
});

describe('fetchCoinbaseBenchmarkCloses', () => {
	test('calls the server-side proxy endpoint with correct params', async () => {
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2026-01-01T00:00:00Z');
		const expectedData: [number, number][] = [
			[1735689600, 42000],
			[1735776000, 42500]
		];
		const fetch = makeProxyFetch(expectedData);

		const closes = await fetchCoinbaseBenchmarkCloses(fetch, 'BTC-USD', start, end);

		expect(fetch).toHaveBeenCalledOnce();
		const calledUrl = new URL(String(fetch.mock.calls[0][0]), 'http://localhost');
		expect(calledUrl.pathname).toBe('/vaults/coinbase-candles');
		expect(calledUrl.searchParams.get('productId')).toBe('BTC-USD');
		expect(calledUrl.searchParams.get('granularity')).toBe('86400');
		expect(calledUrl.searchParams.get('start')).toBe(start.toISOString());
		expect(calledUrl.searchParams.get('end')).toBe(end.toISOString());
		expect(closes).toEqual(expectedData);
	});

	test('throws on proxy error response', async () => {
		const fetch = vi.fn(async () => new Response('error', { status: 502 })) as unknown as Fetch;
		const start = new Date('2025-06-01T00:00:00Z');
		const end = new Date('2025-09-01T00:00:00Z');

		await expect(fetchCoinbaseBenchmarkCloses(fetch, 'ETH-USD', start, end)).rejects.toThrow(
			'Coinbase benchmark proxy failed: 502'
		);
	});
});
