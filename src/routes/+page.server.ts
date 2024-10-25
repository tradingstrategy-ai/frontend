import { getCachedStrategies } from 'trade-executor/models/strategy-info';

export async function load({ fetch }) {
	const strategies = (await getCachedStrategies(fetch)).filter((s) => s.frontpage);

	return { strategies };
}
