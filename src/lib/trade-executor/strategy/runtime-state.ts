/**
 * Strategy runtime state fetching.
 */

import { getConfiguredStrategies } from './configuration';
import type { StrategyConfiguration } from './configuration';
// https://github.com/fram-x/assert-ts/issues/23
import { assert } from 'assert-ts';
import loadError from '../assets/load-error.jpg';
import { type StrategySummary, strategySummarySchema } from './summary';

// use 5 second timeout when fetching strategy metadata
const clientTimeout = 5000;

export type ConnectedRuntimeState = StrategySummary & {
	connected: true;
	id: string;
};

export type DisconnectedRuntimeState = {
	connected: false;
	id: string;
	name: string;
	icon_url: string;
	error: string;
};

export type StrategyRuntimeState = ConnectedRuntimeState | DisconnectedRuntimeState;

export async function getStrategiesWithRuntimeState(
	strats: StrategyConfiguration[],
	fetch: Fetch
): Promise<StrategyRuntimeState[]> {
	// Load runtime state for all strategies parallel
	return await Promise.all(
		strats.map(async ({ id, name, url }) => {
			assert(url, `StrategyConfig URL missing: ${id}`);

			const endpoint = `${url}/metadata`;
			let resp: Partial<Response>;
			let error: string;

			try {
				resp = await fetch(endpoint, { signal: AbortSignal.timeout(clientTimeout) });
			} catch (e) {
				resp = { ok: false, statusText: e.message };
			}

			if (resp.ok) {
				try {
					const payload = await resp.json!();

					const safe = strategySummarySchema.safeParse(payload);
					if (!safe.success) {
						console.error(safe.error.issues);
					}

					const summary = strategySummarySchema.parse(payload);
					return { connected: true, id, ...summary };
				} catch (e) {
					error = (e as Error).message ?? `Error parsing response from ${endpoint}`;
				}
			} else {
				error = resp.statusText ?? `Error fetching ${endpoint}`;
			}

			return {
				connected: false,
				id,
				name,
				icon_url: loadError,
				error
			};
		})
	);
}

/**
 * Get list of configured strategies and pings server for the latest runtime state.
 *
 * Typedefs JSON load from the config.
 */
export async function getConfiguredStrategiesWithRuntimeState(fetch: Fetch) {
	const strats = getConfiguredStrategies();
	return getStrategiesWithRuntimeState(strats, fetch);
}

/**
 * Get runtime state for a single strategy
 *
 */
export async function getStrategyRuntimeState(strategyConfig: StrategyConfiguration, fetch: Fetch) {
	const arr = await getStrategiesWithRuntimeState([strategyConfig], fetch);
	return arr[0];
}
