import { describe, expect, test, vi } from 'vitest';
import { fetchCoinbaseBenchmarkCloses, getCoinbaseGranularitySeconds } from './coinbase';

function makeCoinbaseFetch(requests: URL[]) {
	return vi.fn(async (input: RequestInfo | URL) => {
		const url = new URL(String(input));
		requests.push(url);

		const granularitySeconds = Number(url.searchParams.get('granularity'));
		const start = new Date(url.searchParams.get('start') ?? '');
		const end = new Date(url.searchParams.get('end') ?? '');
		const candles: [number, number, number, number, number, number][] = [];

		for (let ts = start.getTime() / 1000; ts <= end.getTime() / 1000; ts += granularitySeconds) {
			candles.push([ts, 1, 1, 1, ts, 0]);
		}

		return new Response(JSON.stringify([...candles].reverse()), { status: 200 });
	}) as unknown as Fetch;
}

function requestedPointCount(url: URL) {
	const granularitySeconds = Number(url.searchParams.get('granularity'));
	const start = new Date(url.searchParams.get('start') ?? '');
	const end = new Date(url.searchParams.get('end') ?? '');
	return Math.floor((end.getTime() - start.getTime()) / (granularitySeconds * 1000)) + 1;
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
	test('chunks long daily ranges below the Coinbase per-request candle limit', async () => {
		const requests: URL[] = [];
		const fetch = makeCoinbaseFetch(requests);
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2026-01-01T00:00:00Z');

		const closes = await fetchCoinbaseBenchmarkCloses(fetch, 'BTC-USD', start, end);

		expect(requests).toHaveLength(2);
		expect(requests.every((url) => url.searchParams.get('granularity') === '86400')).toBe(true);
		expect(requests.every((url) => requestedPointCount(url) <= 300)).toBe(true);
		expect(closes).toHaveLength(366);
		expect(closes[0][0]).toBe(start.getTime() / 1000);
		expect(closes.at(-1)?.[0]).toBe(end.getTime() / 1000);
	});

	test('uses six-hour candles for a ninety-day range to keep over 100 chart points', async () => {
		const requests: URL[] = [];
		const fetch = makeCoinbaseFetch(requests);
		const start = new Date('2025-01-01T00:00:00Z');
		const end = new Date('2025-04-01T00:00:00Z');

		const closes = await fetchCoinbaseBenchmarkCloses(fetch, 'ETH-USD', start, end);

		expect(requests.every((url) => url.searchParams.get('granularity') === '21600')).toBe(true);
		expect(closes.length).toBeGreaterThanOrEqual(100);
	});
});
