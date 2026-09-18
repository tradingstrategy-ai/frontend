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
 * If a refresh attempt fails (the wrapped function rejects), the failure is not cached:
 * the next call retries `fn` from scratch rather than replaying the same rejection
 * forever. A caller with no cached value yet sees that rejection; a background refresh
 * of an already-cached value fails quietly instead (logged, stale value kept), since
 * nothing is awaiting that promise directly and rejecting it would be an unhandled
 * rejection.
 *
 * The cache function includes a getAge() method that returns the age of the
 * cached value in seconds. This is useful for including an `age` HTTP header.
 * Called with the same args as the original function (for cache lookup).
 *
 * NOTE: Could not find existing NPM implementation that was lightweight and
 * met the requirements. (Extract this and publish?)
 */

type CacheRecord<U> = {
	value?: U;
	loading?: Promise<U>;
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
export default <T extends unknown[], U>(fn: (...args: T) => Promise<U>, ttl: number) => {
	const cache: Record<string, CacheRecord<U>> = {};

	// Wrap original fn with a cache function that implements SWR caching strategy
	async function cacheFn(...args: T): Promise<U> {
		const cached = (cache[JSON.stringify(args)] ??= {});
		const expired = Date.now() - (cached.updatedAt ?? 0) > ttl * 1000;
		const hasValue = 'value' in cached;

		// Async refresh cache if not yet loaded or expired (unless loading in progress)
		if ((!hasValue || expired) && !cached.loading) {
			cached.loading = fn(...args).then(
				(value) => {
					cached.value = value;
					cached.updatedAt = Date.now();
					delete cached.loading;
					return value;
				},
				(err) => {
					// Clear the failed attempt so the next call retries `fn` instead of
					// replaying this rejection forever - without this, a single failure
					// (even a transient one) permanently breaks the cache until the
					// process restarts, since `!cached.loading` would never be true again.
					delete cached.loading;
					if (hasValue) {
						// A background revalidation failed; the stale value was already
						// returned to the caller below, so nothing is awaiting this promise.
						// Resolve it (to the still-valid stale value) rather than reject -
						// rejecting a promise nobody awaits is an unhandled rejection, which
						// by default crashes a Node process (`--unhandled-rejections=throw`).
						console.error('swrCache: background refresh failed', err);
						return cached.value as U;
					}
					throw err;
				}
			);
		}

		// Return cached value if available; or fallback to loading promise
		return hasValue ? (cached.value as U) : cached.loading!;
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
