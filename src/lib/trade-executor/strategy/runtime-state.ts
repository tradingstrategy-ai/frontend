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

export type DisconnectedStrategyRuntimeState = StrategyConfiguration & {
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
		if (!resp.ok) throw new Error(resp.statusText);
		const summary = strategySummarySchema.parse(await resp.json());
		return { connected: true, ...strategy, ...summary };
	} catch (e) {
		return {
			connected: false,
			...strategy,
			icon_url: loadError,
			error: e instanceof Error ? e.message : String(e)
		};
	}
}

export async function getStrategiesWithRuntimeState(fetch: Fetch) {
	// prettier-ignore
	return Promise.all(
		Array.from(
			configuredStrategies,
			async ([id]) => getStrategyRuntimeState(fetch, id) as Promise<StrategyRuntimeState>
		)
	);
}
