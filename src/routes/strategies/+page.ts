import type { PageLoad } from './$types';
import { getConfiguredStrategiesWithMetadata } from 'trade-executor-frontend/strategy/metadata';

export const load: PageLoad = ({ fetch }) => {
	return {
		strategies: getConfiguredStrategiesWithMetadata(fetch)
	};
};
