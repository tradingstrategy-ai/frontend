import { getCachedStrategies } from 'trade-executor/client/strategy-info';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { toListingStrategy } from '$lib/strategies/yaml/adapter';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { getCachedSharePriceReturns } from '$lib/strategies/yaml/share-price';

export async function load({ fetch }) {
	const strategies = await getCachedStrategies(fetch);
	const frontpageStrategies = strategies.filter((s) => s.frontpage && s.connected);

	// Add YAML strategies with frontpage flag
	const yamlFrontpage = [...yamlStrategies.values()].filter((c) => c.frontpage);
	if (yamlFrontpage.length > 0) {
		try {
			const topVaults = await fetchTopVaults(fetch);
			for (const config of yamlFrontpage) {
				const vault = topVaults.vaults.find((v) => v.address === config.vault_address);
				const sharePriceReturns = vault ? await getCachedSharePriceReturns(fetch, vault.id) : undefined;
				frontpageStrategies.push(toListingStrategy(config, vault, sharePriceReturns));
			}
		} catch (e) {
			console.error('Failed to fetch vault data for frontpage YAML strategies:', e);
			for (const config of yamlFrontpage) {
				frontpageStrategies.push(toListingStrategy(config));
			}
		}
	}

	return { strategies: frontpageStrategies };
}
