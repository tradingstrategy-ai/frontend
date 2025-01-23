/**
 * Fetch strategy metadata and return a StrategyInfo object (combination of strategy
 * configuration and metadata attributes).
 */
import { type StrategyConfiguration, configuredStrategies } from '../schemas/configuration';
import { strategySummarySchema } from '../schemas/summary';
import { createConnectedStrategyInfo, createDisconnectedStrategyInfo } from 'trade-executor/models/strategy-info';
import swrCache from '$lib/swrCache';

// use 5 second timeout when fetching strategy metadata
const CLIENT_TIMEOUT = 5000;

export async function getStrategyInfo(fetch: Fetch, strategyConf: StrategyConfiguration) {
	const url = `${strategyConf.url}/metadata`;
	const resp = await fetch(url, { signal: AbortSignal.timeout(CLIENT_TIMEOUT) });
	if (!resp.ok) {
		throw new Error(`Failed to fetch ${url} (status: ${resp.status})`);
	}
	const summary = strategySummarySchema.parse(await resp.json());
	return createConnectedStrategyInfo(strategyConf, summary);
}

export async function getAllStrategies(fetch: Fetch) {
	const strategyConfigs = [...configuredStrategies.values()];
	const strategyPromises = strategyConfigs.map(async (strategyConf) => {
		try {
			return await getStrategyInfo(fetch, strategyConf);
		} catch (err) {
			return createDisconnectedStrategyInfo(strategyConf, err);
		}
	});

	const strategies = await Promise.all(strategyPromises);
	return strategies.sort((a, b) => b.sort_priority - a.sort_priority);
}

// Create a SWR cache for strategies with 1 minute TTL
// NOTE: only use this server-side!
export const getCachedStrategies = swrCache(getAllStrategies, 60);
