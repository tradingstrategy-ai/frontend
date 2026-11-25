import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	createVaultGroupMiniChartCache,
	getMockVaultGroupMiniChartRows,
	getVaultGroupMiniChartLatestApyRows,
	isEligibleVaultGroupMiniChartVault,
	getVaultGroupMiniChartRows,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { filterVaultListingScope } from '$lib/top-vaults/listing/definitions';

const chartCache = createVaultGroupMiniChartCache('curator-mini-chart', async (curatorSlug, fetch) => {
	const { vaults, curators } = await getCachedTopVaults(fetch);
	if (!Object.hasOwn(curators, curatorSlug)) error(404, 'Curator not found');
	const curatorVaults = filterVaultListingScope(vaults, 'curator', curatorSlug);

	const eligibleVaults = curatorVaults.filter(isEligibleVaultGroupMiniChartVault);
	const rows =
		import.meta.env.MODE === 'test'
			? getMockVaultGroupMiniChartRows(eligibleVaults)
			: await getVaultGroupMiniChartRows(eligibleVaults.map((vault) => vault.id));
	const payload = buildProtocolMiniChartPayload(rows, eligibleVaults.length, VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS, {
		latestApyRows: getVaultGroupMiniChartLatestApyRows(eligibleVaults)
	});

	return payload;
});

export async function GET({ params, fetch }) {
	const payload = await chartCache.get(fetch, params.curator);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
