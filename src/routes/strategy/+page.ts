import type { PageLoad } from './$types';
import { getConfiguredStrategiesWithMetadata } from 'trade-executor-frontend/strategy/metadata';

export const load: PageLoad = async ({ fetch }) => {
	return {
		strategies: await getConfiguredStrategiesWithMetadata(fetch)
	};
};
