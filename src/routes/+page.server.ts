import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch }) {
	const strategies = (await getCachedStrategies(fetch)).filter((s) => s.frontpage);

	return { strategies };
}
