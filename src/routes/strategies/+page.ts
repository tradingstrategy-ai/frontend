import { getConfiguredStrategiesWithRuntimeState } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch }) {
	return {
		strategies: getConfiguredStrategiesWithRuntimeState(fetch)
	};
}
