/**
 * Using a server-only load function to serve cached strategies
 *
 * NOTE: do NOT add HTTP caching to this route, since it renders
 * different content based on admin role and IP country
 */
import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import type { PerformanceData } from 'trade-executor/schemas/utility-types.js';
import { getCachedStrategies } from 'trade-executor/client/strategy-info';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { toListingStrategy } from '$lib/strategies/yaml/adapter';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { getCachedSharePriceReturns } from '$lib/strategies/yaml/share-price';

async function fetchTvlData() {
	try {
		const tvlData = await fetchPublicApi<{ strategies_tvl?: PerformanceData }>(fetch, 'impressive-numbers');
		return tvlData.strategies_tvl;
	} catch (e) {
		console.error('Request failed; rendering page without TVL data.');
		console.error(e);
	}
}

async function getYamlStrategies(fetch: Fetch, admin: boolean): Promise<StrategyInfo[]> {
	if (yamlStrategies.size === 0) return [];

	const configs = [...yamlStrategies.values()];
	const filtered = admin ? configs : configs.filter((c) => c.tags.includes('live'));
	if (filtered.length === 0) return [];

	try {
		const topVaults = await fetchTopVaults(fetch);
		return Promise.all(
			filtered.map(async (config) => {
				const vault = topVaults.vaults.find((v) => v.address === config.vault_address);
				const sharePriceReturns = vault ? await getCachedSharePriceReturns(fetch, vault.id) : undefined;
				return toListingStrategy(config, vault, sharePriceReturns);
			})
		);
	} catch (e) {
		console.error('Failed to fetch vault data for YAML strategies:', e);
		return filtered.map((config) => toListingStrategy(config));
	}
}

export async function load({ fetch, locals }) {
	const { admin } = locals;

	// return all strategies for admins, "live" strategies for non-admins
	const apiStrategies = getCachedStrategies(fetch).then((strategies) => {
		return admin ? strategies : strategies.filter((s) => s.tags?.includes('live'));
	});

	const yamlStrategyList = getYamlStrategies(fetch, !!admin);

	// return TVL data for admins only
	const tvlData = admin ? fetchTvlData() : undefined;

	const allStrategies = [...(await apiStrategies), ...(await yamlStrategyList)];
	allStrategies.sort((a, b) => (b.sort_priority ?? 0) - (a.sort_priority ?? 0));

	return {
		strategies: allStrategies,
		tvlData: await tvlData
	};
}
