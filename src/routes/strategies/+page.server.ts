/**
 * Using a server-only load function to serve cached strategies
 *
 * Strategies are cached in-process using NodeCache with 5 minute TTL
 */
import NodeCache from 'node-cache';
import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getConfiguredStrategiesWithRuntimeState } from 'trade-executor/strategy/runtime-state';

// Create NodeCache in-process instance
const cacheTimeSeconds = 300; /* 5 minutes */
const cache = new NodeCache({ stdTTL: cacheTimeSeconds });
const cacheKey = 'strategies';

export async function load({ fetch, setHeaders }) {
	// Check if we have a cached result
	let strategies: StrategyRuntimeState[] | undefined = cache.get(cacheKey);

	// Re-fetch the cached data
	if (!strategies) {
		strategies = await getConfiguredStrategiesWithRuntimeState(fetch);
		cache.set(cacheKey, strategies);
	}

	// Setting cache-control and age headers to limit re-fetching
	// of this resource by browser and reverse proxy / CDN
	const cacheTtlRemaining = (cache.getTtl(cacheKey)! - Date.now()) / 1000;
	const cacheAge = Math.floor(cacheTimeSeconds - cacheTtlRemaining);
	setHeaders({
		'cache-control': `public, max-age=${cacheTimeSeconds}`,
		age: cacheAge.toFixed(0)
	});

	return { strategies };
}
