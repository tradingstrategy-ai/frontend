import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import {
	buildStablecoinChainHeatmapPayload,
	STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS,
	type StablecoinChainHeatmapPayload
} from '$lib/echarts/stablecoin-chain-heatmap';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const compress = promisify(brotliCompress);
const CACHE_TTL_MS = STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS * 1000;
const CACHE_VERSION = 'stablecoin-chain-heatmap-v4';

const cache = new Map<string, { json: string; br: Uint8Array; expires: number; version: string }>();

async function getCachedChartData(fetch: Fetch) {
	const now = Date.now();
	const cacheKey = CACHE_VERSION;
	const existing = cache.get(cacheKey);
	if (existing && existing.version === CACHE_VERSION && now < existing.expires) return existing;

	const startedAt = performance.now();
	const [{ vaults }, stablecoinMetadataIndex] = await Promise.all([
		getCachedTopVaults(fetch),
		import.meta.env.MODE === 'test' ? Promise.resolve([]) : fetchStablecoinMetadataIndex(fetch)
	]);

	const payload: StablecoinChainHeatmapPayload = buildStablecoinChainHeatmapPayload(
		vaults,
		stablecoinMetadataIndex,
		performance.now() - startedAt
	);
	const jsonStr = JSON.stringify(payload);
	const br = new Uint8Array(
		await compress(new TextEncoder().encode(jsonStr), {
			params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
		})
	);

	const value = { json: jsonStr, br, expires: now + CACHE_TTL_MS, version: CACHE_VERSION };
	cache.set(cacheKey, value);
	return value;
}

const cacheHeaders = {
	'cache-control': `public, max-age=${STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS}`,
	'content-type': 'application/json',
	vary: 'Accept-Encoding'
};

export async function GET({ fetch, request }) {
	const data = await getCachedChartData(fetch);
	const acceptsBr = request.headers.get('accept-encoding')?.includes('br');

	if (acceptsBr) {
		return new Response(data.br as BodyInit, {
			headers: { ...cacheHeaders, 'content-encoding': 'br' }
		});
	}

	return new Response(data.json, { headers: cacheHeaders });
}
