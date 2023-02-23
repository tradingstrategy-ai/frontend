import type { PageLoad } from './$types';
import { getConfiguredStrategiesWithRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';

export const load = (({ fetch }) => {
	return {
		strategies: getConfiguredStrategiesWithRuntimeState(fetch)
	};
}) satisfies PageLoad;
