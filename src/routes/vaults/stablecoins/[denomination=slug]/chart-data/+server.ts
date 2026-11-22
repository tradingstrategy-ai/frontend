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
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import {
	buildStablecoinMetadataLookup,
	OFFCHAIN_USD_STABLECOIN_SLUG,
	resolveStablecoinSlug
} from '$lib/stablecoin-metadata/helpers';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const chartCache = createVaultGroupMiniChartCache('stablecoin-mini-chart', async (denominationSlug, fetch) => {
	const [{ vaults }, metadataIndex] = await Promise.all([
		getCachedTopVaults(fetch),
		fetchStablecoinMetadataIndex(fetch)
	]);
	const metadataLookup = buildStablecoinMetadataLookup(metadataIndex);
	const stablecoinVaults = vaults.filter((vault) => {
		const slug = resolveStablecoinSlug(
			{
				slug: vault.denomination_slug,
				symbol: vault.denomination,
				name: vault.normalised_denomination
			},
			metadataLookup
		);
		return slug === denominationSlug;
	});
	if (stablecoinVaults.length === 0) {
		if (denominationSlug === OFFCHAIN_USD_STABLECOIN_SLUG) {
			return buildProtocolMiniChartPayload([], 0, VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS, {
				latestApyRows: []
			});
		}
		error(404, 'Vault stablecoin not found');
	}

	const eligibleVaults = stablecoinVaults.filter(isEligibleVaultGroupMiniChartVault);
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
	const payload = await chartCache.get(fetch, params.denomination);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
