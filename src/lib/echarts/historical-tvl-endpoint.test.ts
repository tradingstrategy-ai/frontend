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

afterEach(() => vi.restoreAllMocks());

test('shares one build across concurrent cold-cache requests and caches its response', async () => {
	const build = vi.fn(async () => ({ series: [1, 2] }));
	const get = createHistoricalTvlEndpoint(build);
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

test('allows the next request to recover after a failed build', async () => {
	const build = vi
		.fn()
		.mockRejectedValueOnce(new Error('Source unavailable'))
		.mockResolvedValueOnce({ series: [1] });
	const get = createHistoricalTvlEndpoint(build);
	const results = await Promise.allSettled([get(event()), get(event())]);
	expect(results.every((result) => result.status === 'rejected')).toBe(true);
	expect(build).toHaveBeenCalledTimes(1);
	expect(await (await get(event())).json()).toEqual({ series: [1] });
	expect(build).toHaveBeenCalledTimes(2);
});

test('rebuilds once when the cache expires', async () => {
	const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
	const build = vi.fn(async () => ({ series: [1] }));
	const get = createHistoricalTvlEndpoint(build);
	await get(event());
	clock.mockReturnValue(HISTORICAL_TVL_CACHE_TTL_SECONDS * 1000);
	await Promise.all([get(event()), get(event())]);
	expect(build).toHaveBeenCalledTimes(2);
});
