import { CHART_DATA_EXTENSION } from '$lib/helpers/edge-cache';
import { error, json, redirect } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	createVaultGroupMiniChartCache,
	getMockVaultGroupMiniChartRows,
	getVaultGroupMiniChartLatestApyRows,
	getVaultGroupMiniChartRows,
	isEligibleVaultGroupMiniChartVault,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCategorySlug, getVaultCategoryTag, isVisibleVaultCategory } from '$lib/top-vaults/categories';

const chartCache = createVaultGroupMiniChartCache('category-mini-chart', async (categorySlug, fetch) => {
	const categoryTag = getVaultCategoryTag(categorySlug);
	if (!isVisibleVaultCategory(categoryTag)) error(404, 'Vault category not found');

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

	return payload;
});

export async function GET({ params, fetch, url }) {
	const categoryTag = getVaultCategoryTag(params.category);
	if (!isVisibleVaultCategory(categoryTag)) error(404, 'Vault category not found');
	const canonicalSlug = getVaultCategorySlug(categoryTag);
	if (params.category !== canonicalSlug) {
		redirect(
			301,
			`/vaults/strategies/${canonicalSlug}/chart-data${url.pathname.endsWith(CHART_DATA_EXTENSION) ? CHART_DATA_EXTENSION : ''}${url.search}`
		);
	}

	return json(await chartCache.get(fetch, canonicalSlug), {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
