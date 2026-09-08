import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload, type ProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	getMockVaultGroupMiniChartRows,
	getVaultGroupMiniChartLatestApyRows,
	getVaultGroupMiniChartRows,
	isEligibleVaultGroupMiniChartVault,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCategoryTag } from '$lib/top-vaults/categories';

const CACHE_VERSION = 'category-mini-chart-v1';
const cache = new Map<string, { payload: ProtocolMiniChartPayload; expires: number }>();

async function getCachedChartData(categorySlug: string, fetch: Fetch) {
	const categoryTag = getVaultCategoryTag(categorySlug);
	const cacheKey = `${CACHE_VERSION}:${categoryTag}`;
	const now = Date.now();
	const cached = cache.get(cacheKey);
	if (cached && now < cached.expires) return cached.payload;

	const { vaults, categories } = await getCachedTopVaults(fetch);
	if (!Object.hasOwn(categories, categoryTag)) error(404, 'Vault category not found');

	const eligibleVaults = vaults
		.filter((vault) => (vault.strategy_tags ?? []).includes(categoryTag))
		.filter(isEligibleVaultGroupMiniChartVault);
	const rows =
		import.meta.env.MODE === 'test'
			? getMockVaultGroupMiniChartRows(eligibleVaults)
			: await getVaultGroupMiniChartRows(eligibleVaults.map((vault) => vault.id));
	const payload = buildProtocolMiniChartPayload(rows, eligibleVaults.length, VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS, {
		latestApyRows: getVaultGroupMiniChartLatestApyRows(eligibleVaults)
	});

	cache.set(cacheKey, { payload, expires: now + VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS * 1000 });
	return payload;
}

export async function GET({ params, fetch }) {
	return json(await getCachedChartData(params.category, fetch), {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
