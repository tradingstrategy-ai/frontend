/**
 * Strategy runtime state fetching.
 */
import { type StrategyConfiguration, configuredStrategies } from '../schemas/configuration';
import { type StrategySummary, strategySummarySchema } from '../schemas/summary';
import loadError from '../assets/load-error.jpg';
import swrCache from '$lib/swrCache';

// use 5 second timeout when fetching strategy metadata
const CLIENT_TIMEOUT = 5000;

export type ConnectedStrategyInfo = StrategyConfiguration &
	StrategySummary & {
		connected: true;
	};

export type DisconnectedStrategyInfo = StrategyConfiguration &
	Partial<StrategySummary> & {
		connected: false;
		icon_url: string;
		error: string;
		sort_priority: number;
	};

export type StrategyInfo = ConnectedStrategyInfo | DisconnectedStrategyInfo;

export async function getStrategyInfo(
	fetch: Fetch,
	strategyConf: StrategyConfiguration
): Promise<ConnectedStrategyInfo> {
	const url = `${strategyConf.url}/metadata`;
	const resp = await fetch(url, { signal: AbortSignal.timeout(CLIENT_TIMEOUT) });
	if (!resp.ok) {
		throw new Error(`Failed to fetch ${url} (status: ${resp.status})`);
	}
	const summary = strategySummarySchema.parse(await resp.json());
	return { connected: true, ...strategyConf, ...summary };
}

function getDisconnectedStrategy(strategyConf: StrategyConfiguration, error: any): DisconnectedStrategyInfo {
	return {
		...strategyConf,
		connected: false,
		icon_url: loadError,
		error: error.message ?? String(error),
		sort_priority: -1
	};
}

export async function getAllStrategies(fetch: Fetch): Promise<StrategyInfo[]> {
	const strategyConfigs = [...configuredStrategies.values()];
	const strategyPromises = strategyConfigs.map(async (strategyConf) => {
		try {
			return await getStrategyInfo(fetch, strategyConf);
		} catch (err) {
			return getDisconnectedStrategy(strategyConf, err);
		}
	});

	const strategies = await Promise.all(strategyPromises);
	return strategies.sort((a, b) => b.sort_priority - a.sort_priority);
}

// Create a SWR cache for strategies with 1 minute TTL
// NOTE: only use this server-side!
export const getCachedStrategies = swrCache(getAllStrategies, 60);
