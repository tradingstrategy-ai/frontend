import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch }) {
	// get first 3 live strategies (excluding outdated)
	const strategies = (await getCachedStrategies(fetch))
		.filter((s) => {
			const isLive = s.tags?.includes('live');
			const isCurrent = !s.new_version_id;
			return isLive && isCurrent;
		})
		.slice(0, 3);

	return { strategies };
}
