import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	createVaultGroupMiniChartCache,
	getMockVaultGroupMiniChartRows,
	getVaultGroupMiniChartLatestApyRows,
	isEligibleVaultGroupMiniChartVault,
	getVaultGroupMiniChartRows,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS,
	VAULT_GROUP_MINI_CHART_THREE_MONTH_LOOKBACK_DAYS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { isUnknownVaultProtocol, UNKNOWN_VAULT_PROTOCOL_SLUG } from '$lib/top-vaults/helpers';

const chartCache = createVaultGroupMiniChartCache('protocol-mini-chart', async (protocolSlug, fetch) => {
	const { vaults } = await getCachedTopVaults(fetch);
	const protocolVaults = vaults.filter((vault) =>
		protocolSlug === UNKNOWN_VAULT_PROTOCOL_SLUG ? isUnknownVaultProtocol(vault) : vault.protocol_slug === protocolSlug
	);
	if (protocolVaults.length === 0) error(404, 'Vault protocol not found');

	const eligibleVaults = protocolVaults.filter(isEligibleVaultGroupMiniChartVault);
	const rows =
		import.meta.env.MODE === 'test'
			? getMockVaultGroupMiniChartRows(eligibleVaults)
			: await getVaultGroupMiniChartRows(eligibleVaults.map((vault) => vault.id));
	const payload = buildProtocolMiniChartPayload(rows, eligibleVaults.length, VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS, {
		latestApyRows: getVaultGroupMiniChartLatestApyRows(eligibleVaults, 'three-months'),
		lookbackDays: VAULT_GROUP_MINI_CHART_THREE_MONTH_LOOKBACK_DAYS
	});

	return payload;
});

export async function GET({ params, fetch }) {
	const payload = await chartCache.get(fetch, params.protocol);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
