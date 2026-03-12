import { fetchTopVaults } from './client';
import type { TopVaults } from './schemas';

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let cache: { data: TopVaults; expires: number } | null = null;

/**
 * Return cached TopVaults data, fetching from the upstream API when the
 * cache is cold or expired. The module-level cache lives for the lifetime
 * of the Node process (server-side only).
 */
export async function getCachedTopVaults(fetch: Fetch): Promise<TopVaults> {
	const now = Date.now();
	if (cache && now < cache.expires) return cache.data;
	const data = await fetchTopVaults(fetch);
	cache = { data, expires: now + CACHE_TTL_MS };
	return data;
}
