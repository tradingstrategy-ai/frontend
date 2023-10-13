/**
 * Endpoint with server-side SWR caching of chains API
 *
 * Since we want the site to load (where possible) even if the API is down,
 * we fallback to a local chains cache when the API request fails.
 *
 * This endpoint is fetched by the root layout and returned as `chainInfo`,
 * making chain lookup data available to all layouts/pages.
 */
import { json } from '@sveltejs/kit';
import swrCache from '$lib/swrCache.js';
import type { ApiChain } from '$lib/helpers/chain';
import { fetchPublicApi } from '$lib/helpers/public-api';

// Fetch chains from API; fallback to local chains cache if API is unavailable
async function fetchChainsWithFallback(fetch: Fetch): Promise<ApiChain[]> {
	try {
		const chains = (await fetchPublicApi(fetch, 'chains')) as ApiChain[];
		// limit cached properties to chain_id, chain_slug, chain_name
		return chains.map(({ chain_id, chain_slug, chain_name }) => ({ chain_id, chain_slug, chain_name }));
	} catch (e) {
		console.warn('API unavailable, falling back to local chains cache', e);
		return (await import('./cache.json')).default;
	}
}

// Create a SWR cache for chains with 5 minute TTL
const cacheTimeSeconds = 5 * 60;
const getCachedChains = swrCache(fetchChainsWithFallback, cacheTimeSeconds);

export async function GET({ fetch }) {
	const chains = await getCachedChains(fetch);

	return json(chains, {
		// Setting cache-control and age headers to limit re-fetching
		// of this resource by browser and reverse proxy / CDN
		headers: {
			'cache-control': `public, max-age=${cacheTimeSeconds}`,
			age: getCachedChains.getAge(fetch).toFixed(0)
		}
	});
}
