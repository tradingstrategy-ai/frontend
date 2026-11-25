import { error } from '@sveltejs/kit';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createWarmCache, getWarmCacheStatus } from './warm-cache';

const HOUR = 60 * 60 * 1000;
let count = 0;
const uniqueName = () => `warm-cache-test-${count++}`;
const fetchStub = vi.fn() as unknown as Fetch;

afterEach(() => vi.restoreAllMocks());

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('createWarmCache', () => {
	test('a cold key is loaded once for concurrent readers', async () => {
		const load = vi.fn(async () => 'value');
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		expect(await Promise.all([cache.get(fetchStub), cache.get(fetchStub), cache.get(fetchStub)])).toEqual([
			'value',
			'value',
			'value'
		]);
		expect(load).toHaveBeenCalledTimes(1);
	});

	test('readers get the current value while a refresh runs, then the new one', async () => {
		const next = deferred<string>();
		const load = vi.fn().mockResolvedValueOnce('old').mockReturnValueOnce(next.promise);
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.get(fetchStub);

		const refreshing = cache.refresh(fetchStub);
		expect(await cache.get(fetchStub)).toBe('old');
		next.resolve('new');
		await refreshing;
		expect(await cache.get(fetchStub)).toBe('new');
	});

	test('a failed refresh keeps the previous value and is reported', async () => {
		const load = vi.fn().mockResolvedValueOnce('good').mockRejectedValueOnce(new Error('upstream down'));
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.get(fetchStub);

		await expect(cache.refresh(fetchStub)).rejects.toThrow('upstream down');
		expect(await cache.get(fetchStub)).toBe('good');
		expect(cache.status()[0]).toMatchObject({ state: 'stale', failures: 1, lastError: 'Error: upstream down' });
	});

	test('refresh is single-flight', async () => {
		const next = deferred<string>();
		const load = vi.fn().mockReturnValue(next.promise);
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		const both = Promise.all([cache.refresh(fetchStub), cache.refresh(fetchStub)]);
		next.resolve('value');
		expect(await both).toEqual(['value', 'value']);
		expect(load).toHaveBeenCalledTimes(1);
	});

	test('reads start a background refresh only after twice the interval', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
		const load = vi.fn().mockResolvedValueOnce('v1').mockResolvedValueOnce('v2');
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.get(fetchStub);

		clock.mockReturnValue(1.5 * HOUR);
		expect(await cache.get(fetchStub)).toBe('v1');
		expect(load).toHaveBeenCalledTimes(1);

		clock.mockReturnValue(2 * HOUR + 1);
		expect(await cache.get(fetchStub)).toBe('v1');
		await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
		await vi.waitFor(async () => expect(await cache.get(fetchStub)).toBe('v2'));
	});

	test('background refreshes from reads back off after a failure', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const load = vi.fn().mockResolvedValueOnce('v1').mockRejectedValue(new Error('down'));
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.get(fetchStub);

		clock.mockReturnValue(3 * HOUR);
		await cache.get(fetchStub);
		await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
		await vi.waitFor(() => expect(cache.status()[0].failures).toBe(1));

		await cache.get(fetchStub);
		await cache.get(fetchStub);
		expect(load).toHaveBeenCalledTimes(2);

		clock.mockReturnValue(3 * HOUR + 15_000);
		await cache.get(fetchStub);
		await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(3));
	});

	test('a cold key that failed fails fast until its backoff ends', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
		const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('up');
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });

		await expect(cache.get(fetchStub)).rejects.toThrow('down');
		await expect(cache.get(fetchStub)).rejects.toThrow('down');
		expect(load).toHaveBeenCalledTimes(1);

		clock.mockReturnValue(15_000);
		expect(await cache.get(fetchStub)).toBe('up');
	});

	test('a derived cache rebuilds in the background when its input version changes', async () => {
		let inputVersion = 'a';
		const load = vi.fn().mockResolvedValueOnce('from a').mockResolvedValueOnce('from b');
		const cache = createWarmCache({
			name: uniqueName(),
			load,
			refreshIntervalMs: HOUR,
			inputVersion: () => inputVersion
		});
		await cache.get(fetchStub);
		expect(await cache.get(fetchStub)).toBe('from a');
		expect(load).toHaveBeenCalledTimes(1);

		inputVersion = 'b';
		expect(await cache.get(fetchStub)).toBe('from a');
		await vi.waitFor(async () => expect(await cache.get(fetchStub)).toBe('from b'));
		expect(load).toHaveBeenCalledTimes(2);
	});

	test('refreshDue refreshes only due keys unless forced, and reports failures after trying all', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
		const load = vi.fn(async (key: string) => {
			if (key === 'broken' && load.mock.calls.length > 2) throw new Error('down');
			return `${key}@${Date.now()}`;
		});
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.get(fetchStub, 'ok');
		await cache.get(fetchStub, 'broken');

		await cache.refreshDue(fetchStub);
		expect(load).toHaveBeenCalledTimes(2);

		clock.mockReturnValue(HOUR);
		await expect(cache.refreshDue(fetchStub)).rejects.toThrow('1 refresh(es) failed');
		expect(load).toHaveBeenCalledTimes(4);
		expect(await cache.get(fetchStub, 'ok')).toBe(`ok@${HOUR}`);
		expect(await cache.get(fetchStub, 'broken')).toBe('broken@0');

		load.mockImplementation(async (key: string) => `${key}@forced`);
		await cache.refreshDue(fetchStub, undefined, true);
		expect(await cache.get(fetchStub, 'ok')).toBe('ok@forced');
	});

	test('refreshDue stops when its signal is aborted', async () => {
		const load = vi.fn(async (key: string) => key);
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.get(fetchStub, 'a');
		await expect(cache.refreshDue(fetchStub, AbortSignal.abort(), true)).rejects.toThrow();
		expect(load).toHaveBeenCalledTimes(1);
	});

	test('keys whose first load is a 4xx are not kept', async () => {
		const load = vi.fn(async (key: string) => {
			if (key === 'unknown') error(404, 'Not found');
			return key;
		});
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await expect(cache.get(fetchStub, 'unknown')).rejects.toMatchObject({ status: 404 });
		await cache.get(fetchStub, 'known');
		expect(cache.keys()).toEqual(['known']);
		// a 404 is not a source failure: the next request tries again immediately
		await expect(cache.get(fetchStub, 'unknown')).rejects.toMatchObject({ status: 404 });
		expect(load).toHaveBeenCalledTimes(3);
	});

	test('keyed caches evict the least recently read entry', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
		const cache = createWarmCache({
			name: uniqueName(),
			load: async (key) => key,
			refreshIntervalMs: HOUR,
			maxEntries: 2
		});
		await cache.get(fetchStub, 'a');
		clock.mockReturnValue(1);
		await cache.get(fetchStub, 'b');
		clock.mockReturnValue(2);
		await cache.get(fetchStub, 'a');
		clock.mockReturnValue(3);
		await cache.get(fetchStub, 'c');
		expect(cache.keys().toSorted()).toEqual(['a', 'c']);
	});

	test('refreshDue drops keyed entries nobody has read for a day instead of refreshing them', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(0);
		const load = vi.fn(async (key: string) => key);
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR, maxEntries: 10 });
		await cache.get(fetchStub, 'read');
		await cache.get(fetchStub, 'idle');

		clock.mockReturnValue(24 * HOUR - 1);
		await cache.get(fetchStub, 'read');
		clock.mockReturnValue(24 * HOUR + 1);
		await cache.refreshDue(fetchStub);
		expect(cache.keys()).toEqual(['read']);
		expect(load).toHaveBeenCalledTimes(3);
	});

	test('status reports degraded when the source is older than allowed', async () => {
		const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-22T12:00:00Z'));
		const name = uniqueName();
		const cache = createWarmCache({
			name,
			load: async () => ({ generated_at: '2026-11-22T11:00:00Z' }),
			refreshIntervalMs: HOUR,
			maxSourceAgeMs: 6 * HOUR,
			sourceTime: (value) => value.generated_at
		});
		await cache.get(fetchStub);
		expect(cache.status()[0]).toMatchObject({ state: 'fresh', sourceAgeSeconds: 3600 });

		clock.mockReturnValue(Date.parse('2026-11-22T18:00:01Z'));
		expect(cache.status()[0].state).toBe('degraded');
		expect(getWarmCacheStatus().some((entry) => entry.cache === name)).toBe(true);
	});

	test('refreshes never forward the visitor cookies', async () => {
		const load = vi.fn(async (_key: string, fetch: Fetch) => {
			await fetch('/internal');
			return 'value';
		});
		const requestFetch = vi.fn(async () => new Response('ok'));
		const cache = createWarmCache({ name: uniqueName(), load, refreshIntervalMs: HOUR });
		await cache.refresh(requestFetch as unknown as Fetch);
		expect(requestFetch).toHaveBeenCalledWith('/internal', expect.objectContaining({ credentials: 'omit' }));
	});
});
