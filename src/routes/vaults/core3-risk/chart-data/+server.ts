import { buildCore3RiskPayload, CORE3_RISK_CACHE_TTL_SECONDS, type Core3RiskPayload } from '$lib/echarts/core3-risk';
import { compressedJsonResponse, compressJson } from '$lib/server/compressed-json';
import { createWarmCache } from '$lib/server/warm-cache';
import { getCachedTopVaults, topVaultsCache } from '$lib/top-vaults/cache';

/** Built from the top-vaults export only, so it is rebuilt whenever that is refreshed. */
const chartDataCache = createWarmCache({
	name: 'core3-risk-chart',
	load: async (_key, fetch) => {
		const startedAt = performance.now();
		const { vaults, core3_protocols } = await getCachedTopVaults(fetch);
		const payload: Core3RiskPayload = buildCore3RiskPayload(vaults, core3_protocols, performance.now() - startedAt);
		return compressJson(payload);
	},
	refreshIntervalMs: CORE3_RISK_CACHE_TTL_SECONDS * 1000,
	inputVersion: () => topVaultsCache.version()
});

export async function GET({ fetch, request }) {
	return compressedJsonResponse(
		await chartDataCache.get(fetch),
		request,
		`public, max-age=${CORE3_RISK_CACHE_TTL_SECONDS}`
	);
}
