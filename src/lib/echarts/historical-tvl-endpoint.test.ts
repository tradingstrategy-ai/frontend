import { brotliDecompressSync } from 'node:zlib';
import type { RequestEvent } from '@sveltejs/kit';
import { afterEach, expect, test, vi } from 'vitest';
import { createHistoricalTvlEndpoint } from './historical-tvl-endpoint';
import { HISTORICAL_TVL_CACHE_TTL_SECONDS } from './historical-tvl';

function event(encoding = '') {
	return {
		fetch,
		request: new Request('http://localhost/chart-data', { headers: { 'accept-encoding': encoding } })
	} as RequestEvent;
}

let endpointCount = 0;
const endpointName = () => `historical-tvl-test-${endpointCount++}`;

afterEach(() => vi.restoreAllMocks());

test('shares one build across concurrent cold-cache requests and caches its response', async () => {
	const build = vi.fn(async () => ({ series: [1, 2] }));
	const get = createHistoricalTvlEndpoint(endpointName(), build);
	const responses = await Promise.all(Array.from({ length: 5 }, () => get(event())));
	expect(build).toHaveBeenCalledTimes(1);
	for (const response of responses) {
		expect(await response.json()).toEqual({ series: [1, 2] });
		expect(response.headers.get('cache-control')).toBe('public, max-age=86400');
	}
	const compressed = await get(event('br'));
	expect(compressed.headers.get('content-encoding')).toBe('br');
	expect(JSON.parse(brotliDecompressSync(new Uint8Array(await compressed.arrayBuffer())).toString())).toEqual({
		series: [1, 2]
	});
	expect(build).toHaveBeenCalledTimes(1);
});

test('retries a failed first build after its backoff, not on every request', async () => {
	const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
	const build = vi
		.fn()
		.mockRejectedValueOnce(new Error('Source unavailable'))
		.mockResolvedValueOnce({ series: [1] });
	const get = createHistoricalTvlEndpoint(endpointName(), build);
	const results = await Promise.allSettled([get(event()), get(event())]);
	expect(results.every((result) => result.status === 'rejected')).toBe(true);
	await expect(get(event())).rejects.toThrow('Source unavailable');
	expect(build).toHaveBeenCalledTimes(1);

	clock.mockReturnValue(15_000);
	expect(await (await get(event())).json()).toEqual({ series: [1] });
	expect(build).toHaveBeenCalledTimes(2);
});

test('serves an expired chart while one background rebuild runs', async () => {
	const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
	let version = 0;
	const build = vi.fn(async () => ({ series: [++version] }));
	const get = createHistoricalTvlEndpoint(endpointName(), build);
	await get(event());

	// past twice the interval without a warmer run: stale value now, one rebuild behind it
	clock.mockReturnValue(2 * HISTORICAL_TVL_CACHE_TTL_SECONDS * 1000 + 1);
	const [first, second] = await Promise.all([get(event()), get(event())]);
	expect(await first.json()).toEqual({ series: [1] });
	expect(await second.json()).toEqual({ series: [1] });
	await vi.waitFor(() => expect(build).toHaveBeenCalledTimes(2));
	await vi.waitFor(async () => expect(await (await get(event())).json()).toEqual({ series: [2] }));
});
