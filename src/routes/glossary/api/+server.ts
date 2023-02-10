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

import { fetchAndParseGlossary } from './glossaryKit';

const cache = new NodeCache();
const cacheTimeSeconds = dev ? 1 : 120;
const cacheKey = 'glossary';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	// Check if we have a cached result in in-process memory
	let cacheValue: string | undefined = cache.get(cacheKey);

	// Reconstruct the cached data.
	// We store stringified JSON in the cache,
	// so we can pipe the result to the client easily
	if (!cacheValue) {
		const baseUrl = url.origin + '/glossary/';
		const glossary = await fetchAndParseGlossary(baseUrl);
		cacheValue = JSON.stringify(glossary);
		cache.set(cacheKey, cacheValue, cacheTimeSeconds);
	}

	// Setting cache-control value will make sure the client-side
	// rendering does not try to refetch() this API endpoint too often.
	// Cache-control public will also make sure our response sticks to
	// CloudFlare or any reverse proxy server cache.
	return new Response(cacheValue, {
		headers: {
			'Content-type': 'application/json',
			'Cache-control': `public; max-age=${cacheTimeSeconds}`
		}
	});
}