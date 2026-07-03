import { afterEach, describe, expect, it, vi } from 'vitest';

function topVaults(generatedAt: string) {
	return {
		generated_at: generatedAt,
		vaults: [],
		core3_protocols: {},
		curators: {}
	};
}

function jsonResponse(generatedAt: string) {
	return new Response(JSON.stringify(topVaults(generatedAt)), {
		headers: { 'content-type': 'application/json' }
	});
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});

	return { promise, resolve, reject };
}

async function importFreshClientCache() {
	vi.resetModules();
	return import('./client-cache');
}

describe('top vault client cache', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('reuses cached data for the same generated_at version', async () => {
		const generatedAt = '2026-07-03T08:00:00.000Z';
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(generatedAt));
		vi.stubGlobal('fetch', fetchMock);

		const { fetchAllVaultData, hasVaultCache } = await importFreshClientCache();

		await expect(fetchAllVaultData(generatedAt)).resolves.toMatchObject({ generated_at: generatedAt });
		await expect(fetchAllVaultData(generatedAt)).resolves.toMatchObject({ generated_at: generatedAt });

		expect(hasVaultCache(generatedAt)).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('refetches when the layout expects a newer generated_at version', async () => {
		const firstGeneratedAt = '2026-07-03T08:00:00.000Z';
		const nextGeneratedAt = '2026-07-03T09:00:00.000Z';
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(jsonResponse(firstGeneratedAt))
			.mockResolvedValueOnce(jsonResponse(nextGeneratedAt));
		vi.stubGlobal('fetch', fetchMock);

		const { fetchAllVaultData, hasVaultCache } = await importFreshClientCache();

		await fetchAllVaultData(firstGeneratedAt);
		expect(hasVaultCache(nextGeneratedAt)).toBe(false);

		await expect(fetchAllVaultData(nextGeneratedAt)).resolves.toMatchObject({ generated_at: nextGeneratedAt });

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1][0]).toBe('/top-vaults/all-data');
	});

	it('retries without HTTP cache when the response is older than expected', async () => {
		const oldGeneratedAt = '2026-07-03T08:00:00.000Z';
		const expectedGeneratedAt = '2026-07-03T09:00:00.000Z';
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(jsonResponse(oldGeneratedAt))
			.mockResolvedValueOnce(jsonResponse(expectedGeneratedAt));
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		vi.stubGlobal('fetch', fetchMock);

		const { fetchAllVaultData } = await importFreshClientCache();

		await expect(fetchAllVaultData(expectedGeneratedAt)).resolves.toMatchObject({
			generated_at: expectedGeneratedAt
		});

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1][0]).toBe('/top-vaults/all-data');
		expect(fetchMock.mock.calls[1][1]).toEqual({ cache: 'reload' });
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('does not let an older in-flight response overwrite newer cached data', async () => {
		const oldGeneratedAt = '2026-07-03T08:00:00.000Z';
		const newGeneratedAt = '2026-07-03T09:00:00.000Z';
		const oldResponse = deferred<Response>();
		const newResponse = deferred<Response>();
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockReturnValueOnce(oldResponse.promise)
			.mockReturnValueOnce(newResponse.promise)
			.mockResolvedValue(jsonResponse(newGeneratedAt));
		vi.stubGlobal('fetch', fetchMock);

		const { fetchAllVaultData, hasVaultCache } = await importFreshClientCache();

		const oldRequest = fetchAllVaultData(oldGeneratedAt);
		const newRequest = fetchAllVaultData(newGeneratedAt);

		newResponse.resolve(jsonResponse(newGeneratedAt));
		await expect(newRequest).resolves.toMatchObject({ generated_at: newGeneratedAt });
		expect(hasVaultCache(newGeneratedAt)).toBe(true);

		oldResponse.resolve(jsonResponse(oldGeneratedAt));
		await expect(oldRequest).resolves.toMatchObject({ generated_at: newGeneratedAt });

		await expect(fetchAllVaultData(newGeneratedAt)).resolves.toMatchObject({ generated_at: newGeneratedAt });
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(hasVaultCache(newGeneratedAt)).toBe(true);
	});
});
