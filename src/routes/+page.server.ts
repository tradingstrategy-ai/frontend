import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch }) {
	const strategies = await getCachedStrategies(fetch);

	return {
		strategies: strategies.filter((s) => s.tags?.includes('live'))
	};
}
