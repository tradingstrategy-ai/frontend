import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import type { RequestHandler } from '@sveltejs/kit';
import { HISTORICAL_TVL_CACHE_TTL_SECONDS } from './historical-tvl';

const compress = promisify(brotliCompress);

/**
 * Cache chart responses and share a single build between concurrent callers.
 * Failed builds are cleared so subsequent requests can recover.
 *
 * @param buildPayload Read the source data and construct the chart payload.
 */
export function createHistoricalTvlEndpoint(buildPayload: (fetch: Fetch) => Promise<unknown>): RequestHandler {
	type CachedResponse = { json: string; br: Uint8Array; expires: number };
	let cache: CachedResponse | null = null;
	let inFlight: Promise<CachedResponse> | null = null;

	async function build(fetch: Fetch): Promise<CachedResponse> {
		const json = JSON.stringify(await buildPayload(fetch));
		const br = new Uint8Array(
			await compress(new TextEncoder().encode(json), {
				params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
			})
		);
		cache = { json, br, expires: Date.now() + HISTORICAL_TVL_CACHE_TTL_SECONDS * 1000 };
		return cache;
	}

	return async ({ fetch, request }) => {
		if (!cache || Date.now() >= cache.expires) {
			inFlight ??= build(fetch).finally(() => {
				inFlight = null;
			});
			await inFlight;
		}
		const data = cache!;
		const acceptsBr = request.headers.get('accept-encoding')?.includes('br');
		return new Response(acceptsBr ? (data.br as BodyInit) : data.json, {
			headers: {
				'cache-control': `public, max-age=${HISTORICAL_TVL_CACHE_TTL_SECONDS}`,
				'content-type': 'application/json',
				vary: 'Accept-Encoding',
				...(acceptsBr ? { 'content-encoding': 'br' } : {})
			}
		});
	};
}
