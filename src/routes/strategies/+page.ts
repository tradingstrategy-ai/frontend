import { getConfiguredStrategiesWithRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';

export async function load({ fetch }) {
	return {
		strategies: getConfiguredStrategiesWithRuntimeState(fetch)
	};
}
