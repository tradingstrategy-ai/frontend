/**
 * Endpoint with server-side caching the dynamically constructed glossary data.
 *
 * Cache is enabled only in production builds.
 * On dev builds we cache for 1 second.
 *
 * Because constructing the data involves parsing a heavy HTML page
 * from a server-side fetched endpoint, we cache the result.
 *
 * We cache any result for 2 minutes on the server-side and client-side (hydrated).
 */
import { dev } from '$app/environment';

// We use node-cache https://www.npmjs.com/package/node-cache
import NodeCache from 'node-cache';

import { fetchAndParseGlossary } from './glossary';

// Create NodeCache in-process instance and set cache timeout very low when on a dev server
const cache = new NodeCache();
const cacheTimeSeconds = dev ? 1 : 120;
const cacheKey = 'glossary';

export async function GET() {
	// Check if we have a cached result in in-process memory
	let cacheValue: string | undefined = cache.get(cacheKey);

	// Reconstruct the cached data.
	// We store stringified JSON in the cache,
	// so we can pipe the result to the client easily
	if (!cacheValue) {
		const glossary = await fetchAndParseGlossary('/glossary/');
		cacheValue = JSON.stringify(glossary);
		cache.set(cacheKey, cacheValue, cacheTimeSeconds);
	}

	// Setting cache-control value will make sure the client-side
	// rendering does not try to refetch() this API endpoint too often.
	// Cache-control public will also make sure our response sticks to
	// CloudFlare or any reverse proxy server cache.
	return new Response(cacheValue, {
		headers: {
			'content-type': 'application/json',
			'cache-control': `public, max-age=${cacheTimeSeconds}`
		}
	});
}
