/**
 * Using a server-only load function to serve cached strategies
 *
 * NOTE: do NOT add HTTP caching to this route, since it renders
 * different content based on admin role and IP country
 */
import type { PerformanceData } from 'trade-executor/schemas/utility-types.js';
import { getCachedStrategies } from 'trade-executor/client/strategy-info';
import { fetchPublicApi } from '$lib/helpers/public-api';

async function fetchTvlData() {
	try {
		const tvlData = await fetchPublicApi<{ strategies_tvl?: PerformanceData }>(fetch, 'impressive-numbers');
		return tvlData.strategies_tvl;
	} catch (e) {
		console.error('Request failed; rendering page without TVL data.');
		console.error(e);
	}
}

export async function load({ fetch, locals }) {
	const { admin } = locals;

	// return all strategies for admins, "live" strategies for non-admins
	const strategies = getCachedStrategies(fetch).then((strategies) => {
		return admin ? strategies : strategies.filter((s) => s.tags?.includes('live'));
	});

	// return TVL data for admins only
	const tvlData = admin ? fetchTvlData() : undefined;

	return {
		strategies: await strategies,
		tvlData: await tvlData
	};
}
