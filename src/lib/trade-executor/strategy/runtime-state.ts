/**
 * Strategy runtime state fetching.
 */
import { type StrategyConfiguration, configuredStrategies } from './configuration';
import { type StrategySummary, strategySummarySchema } from './summary';
import loadError from '../assets/load-error.jpg';
import swrCache from '$lib/swrCache.js';

// use 5 second timeout when fetching strategy metadata
const CLIENT_TIMEOUT = 5000;

export type ConnectedStrategyRuntimeState = StrategyConfiguration &
	StrategySummary & {
		connected: true;
	};

export type DisconnectedStrategyRuntimeState = StrategyConfiguration &
	Partial<StrategySummary> & {
		connected: false;
		icon_url: string;
		error: string;
		sort_priority: number;
	};

export type StrategyRuntimeState = ConnectedStrategyRuntimeState | DisconnectedStrategyRuntimeState;

export async function getStrategyRuntimeState(fetch: Fetch, id: string): Promise<StrategyRuntimeState | undefined> {
	const strategy = configuredStrategies.get(id);
	if (!strategy) return;

	try {
		const resp = await fetch(`${strategy.url}/metadata`, { signal: AbortSignal.timeout(CLIENT_TIMEOUT) });
		if (!resp.ok) {
			throw new Error(`Failed to fetch ${strategy.id} metadata (status: ${resp.status})`);
		}
		const summary = strategySummarySchema.parse(await resp.json());
		return { connected: true, ...strategy, ...summary };
	} catch (e) {
		console.error(e);
		return {
			connected: false,
			...strategy,
			icon_url: loadError,
			error: e instanceof Error ? e.message : String(e),
			sort_priority: -1
		};
	}
}

export async function getStrategiesWithRuntimeState(fetch: Fetch) {
	const strategies = await Promise.all(
		[...configuredStrategies.keys()].map((id) => {
			return getStrategyRuntimeState(fetch, id) as Promise<StrategyRuntimeState>;
		})
	);

	return strategies.sort((a, b) => b.sort_priority - a.sort_priority);
}

// Create a SWR cache for strategies with 1 minute TTL
// NOTE: only use this server-side!
export const getCachedStrategies = swrCache(getStrategiesWithRuntimeState, 60);
