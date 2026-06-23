import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { slimVault } from '$lib/top-vaults/helpers';

const compress = promisify(brotliCompress);

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { json: string; br: Uint8Array; expires: number } | null = null;

async function getCachedChartData(fetch: Fetch) {
	const now = Date.now();
	if (cache && now < cache.expires) return cache;

	const { vaults } = await getCachedTopVaults(fetch);
	const jsonStr = JSON.stringify({ vaults: vaults.map(slimVault) });
	const br = new Uint8Array(
		await compress(new TextEncoder().encode(jsonStr), {
			params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
		})
	);

	cache = { json: jsonStr, br, expires: now + CACHE_TTL_MS };
	return cache;
}

const cacheHeaders = {
	'cache-control': 'public, max-age=3600',
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
