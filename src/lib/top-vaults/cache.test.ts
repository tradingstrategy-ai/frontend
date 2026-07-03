import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTopVaults } from './client';
import type { TopVaults } from './schemas';

vi.mock('./client', () => ({
	fetchTopVaults: vi.fn()
}));

function topVaults(generatedAt: string): TopVaults {
	return {
		generated_at: generatedAt,
		vaults: [],
		core3_protocols: {},
		curators: {}
	};
}

async function importFreshCache() {
	vi.resetModules();
	return import('./cache');
}

describe('getCachedTopVaults', () => {
	beforeEach(() => {
		vi.mocked(fetchTopVaults).mockReset();
	});

	it('reuses the cached payload inside the normal TTL', async () => {
		const first = topVaults('2026-07-03T08:00:00.000Z');
		vi.mocked(fetchTopVaults).mockResolvedValue(first);
		const { getCachedTopVaults } = await importFreshCache();

		await expect(getCachedTopVaults(fetch)).resolves.toBe(first);
		await expect(getCachedTopVaults(fetch)).resolves.toBe(first);

		expect(fetchTopVaults).toHaveBeenCalledTimes(1);
	});

	it('bypasses the cached payload when the caller needs a newer generated_at', async () => {
		const first = topVaults('2026-07-03T08:00:00.000Z');
		const second = topVaults('2026-07-03T09:00:00.000Z');
		vi.mocked(fetchTopVaults).mockResolvedValueOnce(first).mockResolvedValueOnce(second);
		const { getCachedTopVaults } = await importFreshCache();

		await expect(getCachedTopVaults(fetch)).resolves.toBe(first);
		await expect(getCachedTopVaults(fetch, { minGeneratedAt: second.generated_at })).resolves.toBe(second);

		expect(fetchTopVaults).toHaveBeenCalledTimes(2);
	});

	it('does not regress the cache when a forced refresh returns older data', async () => {
		const newer = topVaults('2026-07-03T09:00:00.000Z');
		const older = topVaults('2026-07-03T08:00:00.000Z');
		vi.mocked(fetchTopVaults).mockResolvedValueOnce(newer).mockResolvedValueOnce(older);
		const { getCachedTopVaults } = await importFreshCache();

		await expect(getCachedTopVaults(fetch)).resolves.toBe(newer);
		await expect(getCachedTopVaults(fetch, { minGeneratedAt: '2026-07-03T10:00:00.000Z' })).resolves.toBe(newer);

		expect(fetchTopVaults).toHaveBeenCalledTimes(2);
	});
});
