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
import swrCache from '$lib/swrCache.js';
import { json } from '@sveltejs/kit';

import { fetchAndParseGlossary } from './glossary';

// Create a SWR cache for strategies with 5 minute TTL in production (1 min in dev)
const cacheTimeSeconds = dev ? 1 : 5 * 60;
const getCachedGlossary = swrCache(fetchAndParseGlossary, cacheTimeSeconds);

export async function GET({ fetch }) {
	const glossary = await getCachedGlossary(fetch);

	return json(glossary, {
		// Setting cache-control and age headers to limit re-fetching
		// of this resource by browser and reverse proxy / CDN
		headers: {
			'cache-control': `public, max-age=${cacheTimeSeconds}`,
			age: getCachedGlossary.getAge(fetch).toFixed(0)
		}
	});
}
