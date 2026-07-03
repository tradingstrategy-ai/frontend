import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
		vi.useRealTimers();
		vi.mocked(fetchTopVaults).mockReset();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('reuses the cached payload inside the normal TTL', async () => {
		const first = topVaults('2026-07-03T08:00:00.000Z');
		vi.mocked(fetchTopVaults).mockResolvedValue(first);
		const { getCachedTopVaults } = await importFreshCache();

		await expect(getCachedTopVaults(fetch)).resolves.toBe(first);
		await expect(getCachedTopVaults(fetch)).resolves.toBe(first);

		expect(fetchTopVaults).toHaveBeenCalledTimes(1);
	});

	it('does not regress the cache when a forced refresh returns older data', async () => {
		const newer = topVaults('2026-07-03T09:00:00.000Z');
		const older = topVaults('2026-07-03T08:00:00.000Z');
		vi.mocked(fetchTopVaults).mockResolvedValueOnce(newer).mockResolvedValueOnce(older);
		const { getCachedTopVaults } = await importFreshCache();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-07-03T09:00:00Z'));

		await expect(getCachedTopVaults(fetch)).resolves.toBe(newer);

		vi.setSystemTime(new Date('2026-07-03T10:01:00Z'));
		await expect(getCachedTopVaults(fetch)).resolves.toBe(newer);

		expect(fetchTopVaults).toHaveBeenCalledTimes(2);
	});
});
