import { compressedJsonResponse, compressJson } from '$lib/server/compressed-json';
import { createWarmCache } from '$lib/server/warm-cache';
import { getCachedTopVaults, topVaultsCache } from '$lib/top-vaults/cache';
import { slimVault } from '$lib/top-vaults/helpers';

/** All vaults in the slim chart shape, rebuilt whenever the top-vaults export is refreshed. */
const chartDataCache = createWarmCache({
	name: 'top-vaults-chart-data',
	load: async (_key, fetch) => {
		const { vaults } = await getCachedTopVaults(fetch);
		return compressJson({ vaults: vaults.map(slimVault) });
	},
	refreshIntervalMs: 60 * 60 * 1000,
	inputVersion: () => topVaultsCache.version()
});

export async function GET({ fetch, request }) {
	return compressedJsonResponse(await chartDataCache.get(fetch), request, 'public, max-age=3600');
}
