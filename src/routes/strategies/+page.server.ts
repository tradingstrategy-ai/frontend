/**
 * Using a server-only load function to serve cached strategies
 *
 * Strategies are cached in-process using SWR cache with 5 minute TTL
 */
import swrCache from '$lib/swrCache.js';
import { getStrategiesWithRuntimeState } from 'trade-executor/strategy/runtime-state';

// Create a SWR cache for strategies with 1 minute TTL
const cacheTimeSeconds = 60;
const getCachedStrategies = swrCache(getStrategiesWithRuntimeState, cacheTimeSeconds);

export async function load({ fetch, locals, setHeaders }) {
	const { admin } = locals;

	let strategies = await getCachedStrategies(fetch);

	// non-admin users should only see "live" strategies
	if (!admin) {
		strategies = strategies.filter((s) => s.connected && s.tags.includes('live'));
	}

	// Setting cache-control and age headers to limit re-fetching
	// of this resource by browser and reverse proxy / CDN
	setHeaders({
		'cache-control': `public, max-age=${cacheTimeSeconds}`,
		age: getCachedStrategies.getAge(fetch).toFixed(0)
	});

	return { strategies };
}
