import { afterEach, expect, test, vi } from 'vitest';
import { fetchHistoricalTvl } from './fetch-historical-tvl';

afterEach(() => vi.useRealTimers());

test('recovers from a transient 500 response', async () => {
	vi.useFakeTimers();
	const fetchFn = vi
		.fn<typeof fetch>()
		.mockResolvedValueOnce(new Response(null, { status: 500 }))
		.mockResolvedValueOnce(Response.json({ series: [1] }));
	const result = fetchHistoricalTvl('/chart-data', new AbortController().signal, fetchFn);
	await vi.runAllTimersAsync();
	expect(await result).toEqual({ series: [1] });
	expect(fetchFn).toHaveBeenCalledTimes(2);
});

test('stops after three failed requests', async () => {
	vi.useFakeTimers();
	const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
	const result = expect(fetchHistoricalTvl('/chart-data', new AbortController().signal, fetchFn)).rejects.toThrow(
		'503'
	);
	await vi.runAllTimersAsync();
	await result;
	expect(fetchFn).toHaveBeenCalledTimes(3);
});

test('does not retry permanent failures', async () => {
	const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
	await expect(fetchHistoricalTvl('/chart-data', new AbortController().signal, fetchFn)).rejects.toThrow('404');
	expect(fetchFn).toHaveBeenCalledTimes(1);
});

test('recovers from a network failure', async () => {
	vi.useFakeTimers();
	const fetchFn = vi
		.fn<typeof fetch>()
		.mockRejectedValueOnce(new TypeError('Failed to fetch'))
		.mockResolvedValueOnce(Response.json({ series: [] }));
	const result = fetchHistoricalTvl('/chart-data', new AbortController().signal, fetchFn);
	await vi.runAllTimersAsync();
	expect(await result).toEqual({ series: [] });
});

test('cancels the retry delay when leaving the page', async () => {
	vi.useFakeTimers();
	const controller = new AbortController();
	const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500 }));
	const result = expect(fetchHistoricalTvl('/chart-data', controller.signal, fetchFn)).rejects.toThrow();
	await vi.advanceTimersByTimeAsync(500);
	controller.abort();
	await vi.runAllTimersAsync();
	await result;
	expect(fetchFn).toHaveBeenCalledTimes(1);
});
