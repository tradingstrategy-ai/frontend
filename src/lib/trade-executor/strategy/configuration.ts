import { strategyConfig } from '$lib/config';

/**
 * TypeScript helper for having frontend side configuration for strategies.
 */
export interface StrategyConfiguration {
	/** Strategy id - used internally in the state files, etc. */
	id: string;

	/** Name displayed until we have loaded data from the server-side  */
	name: string;

	/** Webhook server URL */
	url: string;
}

/**
 * Get list of configured strategies.
 *
 * Typedefs JSON load from the config.
 */
export function getConfiguredStrategies(): StrategyConfiguration[] {
	if (!!strategyConfig) {
		return strategyConfig;
	}

	return [];
}

export function getConfiguredStrategyById(id: string): StrategyConfiguration | null {
	const strats = getConfiguredStrategies();
	for (let strat of strats) {
		if (strat.id == id) {
			return strat;
		}
	}
	return null;
}
