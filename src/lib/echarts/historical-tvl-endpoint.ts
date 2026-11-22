import type { RequestHandler } from '@sveltejs/kit';
import { compressedJsonResponse, compressJson } from '$lib/server/compressed-json';
import { createWarmCache } from '$lib/server/warm-cache';
import { HISTORICAL_TVL_CACHE_TTL_SECONDS } from './historical-tvl';

/**
 * Cache a historical TVL chart response and share a single build between concurrent callers.
 * The chart is kept warm by the background warmer: once built, an expired chart is served
 * while it is rebuilt. A failed first build is not cached; it is retried after a short backoff.
 *
 * @param name cache name shown on `/diagnostics`
 * @param buildPayload Read the source data and construct the chart payload.
 */
export function createHistoricalTvlEndpoint(
	name: string,
	buildPayload: (fetch: Fetch) => Promise<unknown>
): RequestHandler {
	const cache = createWarmCache({
		name,
		load: async (_key, fetch) => compressJson(await buildPayload(fetch)),
		refreshIntervalMs: HISTORICAL_TVL_CACHE_TTL_SECONDS * 1000
	});

	return async ({ fetch, request }) =>
		compressedJsonResponse(await cache.get(fetch), request, `public, max-age=${HISTORICAL_TVL_CACHE_TTL_SECONDS}`);
}
