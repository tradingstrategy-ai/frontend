/**
 * Using a server-only load function to serve cached strategies
 */
import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

export async function load({ fetch, locals, setHeaders }) {
	const { admin } = locals;

	let strategies = await getCachedStrategies(fetch);

	// non-admin users should only see "live" strategies
	if (!admin) {
		strategies = strategies.filter((s) => s.connected && s.tags.includes('live'));
	}

	// Setting cache-control and age headers to limit re-fetching
	// of this resource by browser and reverse proxy / CDN
	setHeaders({
		'cache-control': `public, max-age=${getCachedStrategies.ttl}`,
		age: getCachedStrategies.getAge(fetch).toFixed(0)
	});

	return { strategies };
}
