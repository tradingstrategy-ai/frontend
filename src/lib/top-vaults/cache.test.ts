import { beforeEach, describe, expect, test, vi } from 'vitest';

const fetchTopVaults = vi.fn();

vi.mock('./client', () => ({
	fetchTopVaults: (...args: unknown[]) => fetchTopVaults(...args)
}));

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

describe('getCachedTopVaults', () => {
	beforeEach(() => {
		vi.resetModules();
		fetchTopVaults.mockReset();
	});

	test('shares one upstream fetch between concurrent callers', async () => {
		const { getCachedTopVaults } = await import('./cache');
		const upstream = deferred<{ vaults: string[] }>();
		fetchTopVaults.mockReturnValue(upstream.promise);

		const first = getCachedTopVaults(fetch);
		const second = getCachedTopVaults(fetch);
		expect(fetchTopVaults).toHaveBeenCalledTimes(1);

		upstream.resolve({ vaults: ['a'] });
		await expect(Promise.all([first, second])).resolves.toEqual([{ vaults: ['a'] }, { vaults: ['a'] }]);
	});

	test('serves the stale feed while a refresh is in flight', async () => {
		vi.useFakeTimers();
		try {
			const { getCachedTopVaults, getCachedTopVaultsAge } = await import('./cache');
			fetchTopVaults.mockResolvedValueOnce({ vaults: ['old'] });
			await expect(getCachedTopVaults(fetch)).resolves.toEqual({ vaults: ['old'] });

			vi.advanceTimersByTime(61 * 60 * 1000);
			expect(getCachedTopVaultsAge(fetch)).toBeGreaterThan(3600);

			const refresh = deferred<{ vaults: string[] }>();
			fetchTopVaults.mockReturnValueOnce(refresh.promise);

			// Stale value is returned immediately; the refresh runs in the background.
			await expect(getCachedTopVaults(fetch)).resolves.toEqual({ vaults: ['old'] });
			expect(fetchTopVaults).toHaveBeenCalledTimes(2);

			refresh.resolve({ vaults: ['new'] });
			await refresh.promise;
			await expect(getCachedTopVaults(fetch)).resolves.toEqual({ vaults: ['new'] });
		} finally {
			vi.useRealTimers();
		}
	});
});
