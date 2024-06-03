/**
 * Using a server-only load function to serve cached strategies
 *
 * NOTE: do NOT add HTTP caching to this route, since it renders
 * different content based on admin role and IP country
 */
import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';
import { fetchPublicApi } from '$lib/helpers/public-api.js';

export async function load({ fetch, locals }) {
	const { admin } = locals;

	// return all strategies for admins, "live" strategies for non-admins
	const strategies = getCachedStrategies(fetch).then((strategies) => {
		return admin ? strategies : strategies.filter((s) => s.tags?.includes('live'));
	});

	// fail gracefully if TVL data doesn't load
	const tvlData = fetchPublicApi(fetch, 'impressive-numbers')
		.then((data) => data.strategies_tvl)
		.catch((e) => {
			console.error('Request failed; rendering page without TVL data.');
			console.error(e);
		});

	return {
		strategies: await strategies,
		tvlData: await tvlData
	};
}
