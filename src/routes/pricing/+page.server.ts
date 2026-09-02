import { dev } from '$app/environment';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { calculateTotalTvl, isEligibleFrontpageVault, meetsMinTvl } from '$lib/top-vaults/helpers';
import { slimVaultChartDataSchema, type SlimVaultInfo } from '$lib/top-vaults/schemas';

const LIVE_TOP_VAULTS_URL = 'https://tradingstrategy.ai/top-vaults/chart-data';

interface PricingStats {
	chains: number;
	protocols: number;
	stablecoinVaults: number;
	trackedTvl: number;
}

/**
 * Calculate pricing-page coverage figures from the canonical top-vaults dataset.
 *
 * @param topVaults Validated top-vaults dataset
 */
function calculateStats(topVaults: { vaults: SlimVaultInfo[] }): PricingStats {
	const tvlVaults = topVaults.vaults.filter((vault) => isEligibleFrontpageVault(vault) && meetsMinTvl(vault));

	return {
		chains: new Set(topVaults.vaults.map((vault) => vault.chain)).size,
		protocols: new Set(topVaults.vaults.map((vault) => vault.protocol)).size,
		stablecoinVaults: topVaults.vaults.filter((vault) => vault.stablecoinish).length,
		trackedTvl: calculateTotalTvl(tvlVaults)
	};
}

export async function load({ fetch }) {
	try {
		return { stats: calculateStats(await getCachedTopVaults(fetch)) };
	} catch {
		// Local development does not normally have production R2 credentials.
		// Use the live site's public response so local pricing figures match production.
		if (dev) {
			try {
				const response = await fetch(LIVE_TOP_VAULTS_URL);
				if (!response.ok) return { stats: null };
				const topVaults = slimVaultChartDataSchema.parse(await response.json());
				return { stats: calculateStats(topVaults) };
			} catch {
				return { stats: null };
			}
		}

		return { stats: null };
	}
}
