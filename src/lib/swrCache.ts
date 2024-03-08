/*
 * SWR (stale-while-revalidate) caching strategy. Use the exported function
 * to memoize an async function with an SWR cache implementation.
 *
 * The first time the returned cache function is called, it invokes the
 * original async function and returns the (promised) result. Subsequent
 * calls return the cached value (even if it's stale/expired).
 *
 * An expiration check is made on every request. If the value is stale it is
 * asynchronously reloaded so a fresh value is available for future requests.
 * The stale value continues to be returned while the async refresh completes.
 * (stale-while-revalidate)
 *
 * The cache function includes a getAge() method that returns the age of the
 * cached value in seconds. This is useful for including an `age` HTTP header.
 * Called with the same args as the original function (for cache lookup).
 *
 * NOTE: Could not find existing NPM implementation that was lightweight and
 * met the requirements. (Extract this and publish?)
 */

type CacheRecord = {
	value?: any;
	loading?: Promise<any>;
	updatedAt?: number;
};

/**
 * Cache memoization function that implements SWR caching strategy.
 * Expects an async function and a TTL in seconds; returns a memoized function
 * with the same signature as the original, that also responds to getAge().
 *
 * @param fn - original function to memoize
 * @param ttl - cache TTL in seconds
 */
export default <T extends any[], U>(fn: (...args: T) => Promise<U>, ttl: number) => {
	const cache: Record<string, CacheRecord> = {};

	// Wrap original fn with a cache function that implements SWR caching strategy
	async function cacheFn(...args: T): Promise<U> {
		const cached = (cache[JSON.stringify(args)] ??= {});
		const expired = Date.now() - (cached.updatedAt ?? 0) > ttl * 1000;
		const hasValue = 'value' in cached;

		// Async refresh cache if not yet loaded or expired (unless loading in progress)
		if ((!hasValue || expired) && !cached.loading) {
			cached.loading = fn(...args).then((value) => {
				cached.value = value;
				cached.updatedAt = Date.now();
				delete cached.loading;
				return value;
			});
		}

		// Return cached value if available; or fallback to loading promise
		return hasValue ? cached.value : cached.loading;
	}

	cacheFn.ttl = ttl;

	/**
	 * Return cache age (in seconds). Expects the same args as the original
	 * function (needed for cache lookup).
	 */
	cacheFn.getAge = (...args: T) => {
		const { updatedAt: ts } = cache[JSON.stringify(args)] ?? {};
		return ts ? Math.floor((Date.now() - ts) / 1000) : 0;
	};

	return cacheFn;
};
