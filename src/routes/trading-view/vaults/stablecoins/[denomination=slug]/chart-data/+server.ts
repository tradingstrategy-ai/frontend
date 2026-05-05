import { error, json } from '@sveltejs/kit';
import { buildProtocolMiniChartPayload, type ProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
import {
	getMockVaultGroupMiniChartRows,
	isEligibleVaultGroupMiniChartVault,
	getVaultGroupMiniChartRows,
	VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS
} from '$lib/echarts/vault-group-mini-chart-server';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { buildStablecoinMetadataLookup, resolveStablecoinSlug } from '$lib/stablecoin-metadata/helpers';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const CACHE_VERSION = 'stablecoin-mini-chart-v3';
const cache = new Map<string, { payload: ProtocolMiniChartPayload; expires: number; version: string }>();

async function getCachedChartData(denominationSlug: string, fetch: Fetch) {
	const cacheKey = `${CACHE_VERSION}:${denominationSlug}`;
	const now = Date.now();
	const cached = cache.get(cacheKey);
	if (cached && cached.version === CACHE_VERSION && now < cached.expires) return cached.payload;

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
	if (stablecoinVaults.length === 0) error(404, 'Vault stablecoin not found');

	const eligibleVaults = stablecoinVaults.filter(isEligibleVaultGroupMiniChartVault);
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
	const payload = await getCachedChartData(params.denomination, fetch);

	return json(payload, {
		headers: {
			'cache-control': `public, max-age=${VAULT_GROUP_MINI_CHART_CACHE_TTL_SECONDS}`,
			vary: 'Accept-Encoding'
		}
	});
}
