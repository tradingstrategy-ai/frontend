/**
 * Using a server-only load function to serve cached strategies
 *
 * NOTE: do NOT add HTTP caching to this route, since it renders
 * different content based on admin role and IP country
 */
import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch, locals }) {
	const { admin } = locals;

	let strategies = await getCachedStrategies(fetch);

	// non-admin users should only see "live" strategies
	if (!admin) {
		strategies = strategies.filter((s) => s.connected && s.tags.includes('live'));
	}

	return { strategies };
}
