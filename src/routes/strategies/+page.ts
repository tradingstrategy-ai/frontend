import type { PageLoad } from './$types';
import { getConfiguredStrategiesWithRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';

export const load: PageLoad = ({ fetch }) => {
	return {
		strategies: getConfiguredStrategiesWithRuntimeState(fetch)
	};
};
