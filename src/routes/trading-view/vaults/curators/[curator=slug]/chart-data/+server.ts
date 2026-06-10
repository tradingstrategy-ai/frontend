import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload, type ProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	getMockVaultGroupMiniChartRows,
	isEligibleVaultGroupMiniChartVault,
	getVaultGroupMiniChartRows,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const CACHE_VERSION = 'curator-mini-chart-v1';
const cache = new Map<string, { payload: ProtocolMiniChartPayload; expires: number; version: string }>();

async function getCachedChartData(curatorSlug: string, fetch: Fetch) {
	const cacheKey = `${CACHE_VERSION}:${curatorSlug}`;
	const now = Date.now();
	const cached = cache.get(cacheKey);
	if (cached && cached.version === CACHE_VERSION && now < cached.expires) return cached.payload;

	const { vaults } = await getCachedTopVaults(fetch);
	const curatorVaults = vaults.filter((vault) => vault.curator_slug === curatorSlug);
	if (curatorVaults.length === 0) error(404, 'Curator not found');

	const eligibleVaults = curatorVaults.filter(isEligibleVaultGroupMiniChartVault);
	const rows =
		import.meta.env.MODE === 'test'
			? getMockVaultGroupMiniChartRows(eligibleVaults)
			: await getVaultGroupMiniChartRows(eligibleVaults.map((vault) => vault.id));
	const payload = buildProtocolMiniChartPayload(rows, eligibleVaults.length, VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS);

	cache.set(cacheKey, {
		payload,
		expires: now + VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS * 1000,
		version: CACHE_VERSION
	});

	return payload;
}

export async function GET({ params, fetch }) {
	const payload = await getCachedChartData(params.curator, fetch);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
