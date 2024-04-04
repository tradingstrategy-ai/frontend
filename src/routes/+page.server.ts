import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch }) {
	const strategies = await getCachedStrategies(fetch);

	// return first 3 live strategies
	return {
		strategies: strategies.filter((s) => s.tags?.includes('live')).slice(0, 3)
	};
}
