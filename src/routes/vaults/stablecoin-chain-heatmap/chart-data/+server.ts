import { fetchStablecoinMetadataIndex, stablecoinMetadataCache } from '$lib/stablecoin-metadata/client';
import {
	buildStablecoinChainHeatmapPayload,
	STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS,
	type StablecoinChainHeatmapPayload
} from '$lib/echarts/stablecoin-chain-heatmap';
import { compressedJsonResponse, compressJson } from '$lib/server/compressed-json';
import { createWarmCache } from '$lib/server/warm-cache';
import { getCachedTopVaults, topVaultsCache } from '$lib/top-vaults/cache';

/** Built from the top-vaults export and stablecoin metadata; rebuilt when either is refreshed. */
const chartDataCache = createWarmCache({
	name: 'stablecoin-chain-heatmap-chart',
	load: async (_key, fetch) => {
		const startedAt = performance.now();
		const [{ vaults }, stablecoinMetadataIndex] = await Promise.all([
			getCachedTopVaults(fetch),
			import.meta.env.MODE === 'test' ? Promise.resolve([]) : fetchStablecoinMetadataIndex(fetch)
		]);

		const payload: StablecoinChainHeatmapPayload = buildStablecoinChainHeatmapPayload(
			vaults,
			stablecoinMetadataIndex,
			performance.now() - startedAt
		);
		return compressJson(payload);
	},
	refreshIntervalMs: STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS * 1000,
	inputVersion: () => `${topVaultsCache.version()}|${stablecoinMetadataCache.version()}`
});

export async function GET({ fetch, request }) {
	return compressedJsonResponse(
		await chartDataCache.get(fetch),
		request,
		`public, max-age=${STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS}`
	);
}
