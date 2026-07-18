import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { buildCore3RiskPayload, CORE3_RISK_CACHE_TTL_SECONDS, type Core3RiskPayload } from '$lib/echarts/core3-risk';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const compress = promisify(brotliCompress);
const CACHE_TTL_MS = CORE3_RISK_CACHE_TTL_SECONDS * 1000;
const CACHE_VERSION = 'core3-risk-v1';

const cache = new Map<string, { json: string; br: Uint8Array; expires: number; version: string }>();

async function getCachedChartData(fetch: Fetch) {
	const now = Date.now();
	const cacheKey = CACHE_VERSION;
	const existing = cache.get(cacheKey);
	if (existing && existing.version === CACHE_VERSION && now < existing.expires) return existing;

	const startedAt = performance.now();
	const { vaults, core3_protocols } = await getCachedTopVaults(fetch);
	const payload: Core3RiskPayload = buildCore3RiskPayload(vaults, core3_protocols, performance.now() - startedAt);
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
	'cache-control': `public, max-age=${CORE3_RISK_CACHE_TTL_SECONDS}`,
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
