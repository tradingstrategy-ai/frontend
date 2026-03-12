import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const compress = promisify(brotliCompress);

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let brCache: { json: string; br: Uint8Array; expires: number } | null = null;

async function getCachedAllData(fetch: Fetch) {
	const now = Date.now();
	if (brCache && now < brCache.expires) return brCache;

	const topVaults = await getCachedTopVaults(fetch);
	const jsonStr = JSON.stringify(topVaults);
	const br = new Uint8Array(
		await compress(new TextEncoder().encode(jsonStr), {
			params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
		})
	);

	brCache = { json: jsonStr, br, expires: now + CACHE_TTL_MS };
	return brCache;
}

const cacheHeaders = {
	'cache-control': 'public, max-age=7200',
	'content-type': 'application/json',
	vary: 'Accept-Encoding'
};

export async function GET({ fetch, request }) {
	const data = await getCachedAllData(fetch);
	const acceptsBr = request.headers.get('accept-encoding')?.includes('br');

	if (acceptsBr) {
		return new Response(data.br as BodyInit, {
			headers: { ...cacheHeaders, 'content-encoding': 'br' }
		});
	}

	return new Response(data.json, { headers: cacheHeaders });
}
