import { getCachedStrategies } from 'trade-executor/client/strategy-info';

export async function load({ fetch }) {
	const strategies = await getCachedStrategies(fetch);

	return {
		strategies: strategies.filter((s) => s.frontpage && s.connected)
	};
}
