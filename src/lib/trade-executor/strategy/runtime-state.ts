/**
 * Strategy runtime state fetching.
 */
import { type StrategyConfiguration, configuredStrategies } from './configuration';
import { type StrategySummary, strategySummarySchema } from './summary';
import loadError from '../assets/load-error.jpg';

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
			error: e instanceof Error ? e.message : String(e)
		};
	}
}

export function getStrategiesWithRuntimeState(fetch: Fetch) {
	return Promise.all(
		[...configuredStrategies.keys()].map((id) => {
			return getStrategyRuntimeState(fetch, id) as Promise<StrategyRuntimeState>;
		})
	);
}
