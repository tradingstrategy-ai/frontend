import { fetchTopVaults } from './client';
import { isOlderThan, normaliseGeneratedAt } from './generated-at';
import type { TopVaults } from './schemas';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { data: TopVaults; expires: number } | null = null;

interface CacheOptions {
	/**
	 * Caller-known dataset version. When set, a cached payload older than this
	 * timestamp is bypassed even if its wall-clock TTL has not expired.
	 */
	minGeneratedAt?: string | Date | null;
}

/**
 * Return cached TopVaults data, fetching from the upstream API when the
 * cache is cold or expired. The module-level cache lives for the lifetime
 * of the Node process (server-side only).
 */
export async function getCachedTopVaults(fetch: Fetch, options: CacheOptions = {}): Promise<TopVaults> {
	const now = Date.now();
	const minGeneratedAt = normaliseGeneratedAt(options.minGeneratedAt);
	if (cache && now < cache.expires && !isOlderThan(cache.data.generated_at, minGeneratedAt)) return cache.data;
	const data = await fetchTopVaults(fetch);

	if (cache && isOlderThan(data.generated_at, normaliseGeneratedAt(cache.data.generated_at))) {
		return cache.data;
	}

	cache = { data, expires: now + CACHE_TTL_MS };
	return data;
}
