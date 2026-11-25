import { createWarmCache } from '$lib/server/warm-cache';
import { fetchTopVaults } from './client';
import type { TopVaults } from './schemas';

/**
 * The validated and normalised top-vaults export, shared by every server-side vault page,
 * listing and chart. The background warmer reloads it hourly (the export itself is
 * regenerated about hourly); requests never wait for that reload. See
 * `$lib/server/warm-cache` and docs/cache-invalidation.md.
 */
export const topVaultsCache = createWarmCache<TopVaults>({
	name: 'top-vaults',
	load: (_key, fetch, signal) => fetchTopVaults(fetch, signal),
	refreshIntervalMs: 60 * 60 * 1000,
	maxSourceAgeMs: 6 * 60 * 60 * 1000,
	sourceTime: (data) => data.generated_at
});

/**
 * Return the server-cached top-vaults export. Waits only on a cold process.
 *
 * @param fetch SvelteKit fetch (used only when the export is read over HTTP)
 */
export function getCachedTopVaults(fetch: Fetch): Promise<TopVaults> {
	return topVaultsCache.get(fetch);
}
