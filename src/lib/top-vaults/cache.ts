import swrCache from '$lib/swrCache';
import { fetchTopVaults } from './client';
import type { TopVaults } from './schemas';

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Module-level SWR cache for the top vaults feed (server-side only, lives for the
 * lifetime of the Node process).
 *
 * `swrCache` gives two properties a plain expiry check lacked:
 *
 * - single-flight: one upstream fetch per expiry, however many requests arrive at once;
 * - stale-while-revalidate: callers keep getting the previous feed while the refresh runs,
 *   so a slow or failing R2 read never blocks page rendering once a value exists.
 *
 * The cache key is derived from the arguments; SvelteKit's `fetch` serialises to `null`,
 * so every caller shares the single entry.
 */
const cachedTopVaults = swrCache((fetch: Fetch) => fetchTopVaults(fetch), CACHE_TTL_SECONDS);

/**
 * Return cached TopVaults data, fetching from the upstream API when the cache is cold
 * and refreshing in the background once it is stale.
 *
 * @param fetch SvelteKit's `fetch` (used by the private-URL fallback source)
 */
export function getCachedTopVaults(fetch: Fetch): Promise<TopVaults> {
	return cachedTopVaults(fetch);
}

/** Age of the cached feed in seconds (0 when the cache is cold). */
export function getCachedTopVaultsAge(fetch: Fetch): number {
	return cachedTopVaults.getAge(fetch);
}
