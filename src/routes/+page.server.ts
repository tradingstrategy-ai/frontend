import { getCachedStrategies } from 'trade-executor/client/strategy-info';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { toListingStrategy } from '$lib/strategies/yaml/adapter';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { type SlimVaultInfo, slimVaultKeys } from '$lib/top-vaults/schemas';
import { getCachedSharePriceReturns } from '$lib/strategies/yaml/share-price';
import { fetchLatestFredValue, fetchLatestTreasuryRate } from '$lib/reference-rates';

/**
 * Strip full VaultInfo objects to only the fields needed by landing page components.
 * Reduces serialised page size from ~24 MB to ~1.3 MB (3,516 vaults × 80+ → 12 fields).
 */
function slimVault(vault: Record<string, unknown>): SlimVaultInfo {
	const slim = {} as Record<string, unknown>;
	for (const key of slimVaultKeys) {
		slim[key] = vault[key as string];
	}
	return slim as SlimVaultInfo;
}

export async function load({ fetch }) {
	const [strategies, topVaultsResult, ratesResult] = await Promise.all([
		getCachedStrategies(fetch),
		fetchTopVaults(fetch).catch((e) => {
			console.error('Failed to fetch top vaults:', e);
			return undefined;
		}),
		Promise.all([fetchLatestFredValue('SNDR'), fetchLatestTreasuryRate()])
	]);

	const frontpageStrategies = strategies.filter((s) => s.frontpage && s.connected);

	// Add YAML strategies with frontpage flag
	const yamlFrontpage = [...yamlStrategies.values()].filter((c) => c.frontpage);
	if (yamlFrontpage.length > 0 && topVaultsResult) {
		try {
			for (const config of yamlFrontpage) {
				const vault = topVaultsResult.vaults.find((v) => v.address === config.vault_address);
				const sharePriceReturns = vault ? await getCachedSharePriceReturns(fetch, vault.id) : undefined;
				frontpageStrategies.push(toListingStrategy(config, vault, sharePriceReturns));
			}
		} catch (e) {
			console.error('Failed to fetch vault data for frontpage YAML strategies:', e);
			for (const config of yamlFrontpage) {
				frontpageStrategies.push(toListingStrategy(config));
			}
		}
	} else if (yamlFrontpage.length > 0) {
		for (const config of yamlFrontpage) {
			frontpageStrategies.push(toListingStrategy(config));
		}
	}

	const [savingsRate, treasuryRate] = ratesResult;

	return {
		strategies: frontpageStrategies,
		savingsRate,
		treasuryRate,
		topVaults: topVaultsResult
			? { generated_at: topVaultsResult.generated_at, vaults: topVaultsResult.vaults.map(slimVault) }
			: undefined
	};
}
