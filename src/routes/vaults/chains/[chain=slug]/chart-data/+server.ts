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
import { getChainsBySlug } from '$lib/helpers/chain';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const chartCache = createVaultGroupMiniChartCache('chain-mini-chart', async (chainSlug, fetch) => {
	const chains = getChainsBySlug(chainSlug);
	if (chains.length === 0) error(404, 'Chain not found');

	const chainIds = new Set(chains.map((chain) => chain.id));
	const { vaults } = await getCachedTopVaults(fetch);
	const chainVaults = vaults.filter((vault) => chainIds.has(vault.chain_id));
	if (chainVaults.length === 0) error(404, 'Vault chain not found');

	const eligibleVaults = chainVaults.filter(isEligibleVaultGroupMiniChartVault);
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
	const payload = await chartCache.get(fetch, params.chain);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
