import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import swrCache from './swrCache';

/** A promise plus its resolve/reject, for controlling exactly when `fn` settles. */
function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime('2026-01-01T00:00:00Z');
});

afterEach(() => {
	vi.useRealTimers();
});

test('calls the wrapped function once and reuses the value within the TTL', async () => {
	const fn = vi.fn(async () => 'value');
	const cached = swrCache(fn, 60);

	expect(await cached()).toBe('value');
	expect(await cached()).toBe('value');
	expect(fn).toHaveBeenCalledTimes(1);
});

test('serves the stale value immediately and refreshes in the background once expired', async () => {
	const fn = vi.fn().mockResolvedValueOnce('value-0').mockResolvedValueOnce('value-1');
	const cached = swrCache(fn, 60);

	expect(await cached()).toBe('value-0');

	vi.setSystemTime('2026-01-01T00:02:00Z'); // 2 minutes later, past the 60s TTL

	// the expired call still returns the old value synchronously (stale-while-revalidate)...
	expect(await cached()).toBe('value-0');
	// ...while a refresh has been kicked off in the background
	expect(fn).toHaveBeenCalledTimes(2);

	// let the background refresh's `.then()` settle (a plain microtask, unaffected by
	// fake timers, but `advanceTimersByTimeAsync` flushes it deterministically)
	await vi.advanceTimersByTimeAsync(0);

	expect(await cached()).toBe('value-1');
	expect(fn).toHaveBeenCalledTimes(2);
});

test('shares one in-flight call across concurrent callers with no cached value yet', async () => {
	const { promise, resolve } = deferred<string>();
	const fn = vi.fn(() => promise);
	const cached = swrCache(fn, 60);

	const first = cached();
	const second = cached();
	expect(fn).toHaveBeenCalledTimes(1);

	resolve('value');
	expect(await first).toBe('value');
	expect(await second).toBe('value');
});

test('retries on the next call instead of replaying a rejection forever', async () => {
	const fn = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('recovered');
	const cached = swrCache(fn, 60);

	await expect(cached()).rejects.toThrow('boom');
	expect(fn).toHaveBeenCalledTimes(1);

	// a second call right away (no time has passed) must not just replay the cached rejection
	expect(await cached()).toBe('recovered');
	expect(fn).toHaveBeenCalledTimes(2);
});

test('keeps serving the stale value and logs when a background refresh rejects, then retries later', async () => {
	const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	const fn = vi
		.fn()
		.mockResolvedValueOnce('value-0')
		.mockRejectedValueOnce(new Error('boom'))
		.mockResolvedValueOnce('value-2');
	const cached = swrCache(fn, 60);

	expect(await cached()).toBe('value-0');

	vi.setSystemTime('2026-01-01T00:02:00Z');

	// the failed background refresh must not surface to this caller
	expect(await cached()).toBe('value-0');
	expect(fn).toHaveBeenCalledTimes(2);
	await vi.advanceTimersByTimeAsync(0); // let the rejection's `.then()` handler run
	expect(errorSpy).toHaveBeenCalledWith('swrCache: background refresh failed', expect.any(Error));

	// the failed attempt must not be stuck: a later call retries rather than staying broken
	vi.setSystemTime('2026-01-01T00:04:00Z');
	expect(await cached()).toBe('value-0'); // still stale while this next refresh is in flight
	expect(fn).toHaveBeenCalledTimes(3);
	await vi.advanceTimersByTimeAsync(0);
	expect(await cached()).toBe('value-2');

	errorSpy.mockRestore();
});

test('getAge reports 0 before any value is cached and grows after a successful load', async () => {
	const fn = vi.fn(async () => 'value');
	const cached = swrCache(fn, 60);

	expect(cached.getAge()).toBe(0);

	await cached();
	expect(cached.getAge()).toBe(0);

	vi.setSystemTime('2026-01-01T00:00:30Z');
	expect(cached.getAge()).toBe(30);
});

test('caches distinct argument combinations independently', async () => {
	const fn = vi.fn(async (id: string) => `value-for-${id}`);
	const cached = swrCache(fn, 60);

	expect(await cached('a')).toBe('value-for-a');
	expect(await cached('b')).toBe('value-for-b');
	expect(await cached('a')).toBe('value-for-a');
	expect(fn).toHaveBeenCalledTimes(2);
});
