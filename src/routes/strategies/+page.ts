import { getConfiguredStrategiesWithRuntimeState } from 'trade-executor-frontend/strategy/runtime-state';

export async function load({ fetch }) {
	return {
		strategies: getConfiguredStrategiesWithRuntimeState(fetch)
	};
}
