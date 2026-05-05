import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload, type ProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	getMockVaultGroupMiniChartRows,
	isEligibleVaultGroupMiniChartVault,
	getVaultGroupMiniChartRows,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS
} from '$lib/echarts/vault-group-mini-chart-server';
import { getChainsBySlug } from '$lib/helpers/chain';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const CACHE_VERSION = 'chain-mini-chart-v3';
const cache = new Map<string, { payload: ProtocolMiniChartPayload; expires: number; version: string }>();

async function getCachedChartData(chainSlug: string, fetch: Fetch) {
	const cacheKey = `${CACHE_VERSION}:${chainSlug}`;
	const now = Date.now();
	const cached = cache.get(cacheKey);
	if (cached && cached.version === CACHE_VERSION && now < cached.expires) return cached.payload;

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
	const payload = buildProtocolMiniChartPayload(rows, eligibleVaults.length, VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS);

	cache.set(cacheKey, {
		payload,
		expires: now + VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS * 1000,
		version: CACHE_VERSION
	});

	return payload;
}

export async function GET({ params, fetch }) {
	const payload = await getCachedChartData(params.chain, fetch);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
