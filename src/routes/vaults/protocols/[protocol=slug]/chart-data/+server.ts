import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload, type ProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	getMockVaultGroupMiniChartRows,
	getVaultGroupMiniChartLatestApyRows,
	isEligibleVaultGroupMiniChartVault,
	getVaultGroupMiniChartRows,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS,
	VAULT_GROUP_MINI_CHART_THREE_MONTH_LOOKBACK_DAYS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { isUnknownVaultProtocol, UNKNOWN_VAULT_PROTOCOL_SLUG } from '$lib/top-vaults/helpers';

const CACHE_VERSION = 'protocol-mini-chart-v7';
const cache = new Map<string, { payload: ProtocolMiniChartPayload; expires: number; version: string }>();

async function getCachedChartData(protocolSlug: string, fetch: Fetch) {
	const cacheKey = `${CACHE_VERSION}:${protocolSlug}`;
	const now = Date.now();
	const cached = cache.get(cacheKey);
	if (cached && cached.version === CACHE_VERSION && now < cached.expires) return cached.payload;

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

	cache.set(cacheKey, {
		payload,
		expires: now + VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS * 1000,
		version: CACHE_VERSION
	});

	return payload;
}

export async function GET({ params, fetch }) {
	const payload = await getCachedChartData(params.protocol, fetch);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
