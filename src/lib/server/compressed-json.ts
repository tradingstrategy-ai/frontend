/**
 * Pre-compressed JSON bodies for cached chart endpoints: the payload is serialised and
 * Brotli-compressed once when the cache is (re)built, not on every request.
 */
import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';

const compress = promisify(brotliCompress);

export interface CompressedJson {
	json: string;
	br: Uint8Array;
}

/**
 * Serialise and Brotli-compress a payload.
 *
 * @param payload JSON-serialisable value
 */
export async function compressJson(payload: unknown): Promise<CompressedJson> {
	const json = JSON.stringify(payload);
	const br = new Uint8Array(
		await compress(new TextEncoder().encode(json), {
			params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
		})
	);
	return { json, br };
}

/**
 * Respond with the compressed body when the client accepts Brotli, else the plain JSON.
 *
 * @param data cached body
 * @param request incoming request (for `Accept-Encoding`)
 * @param cacheControl `Cache-Control` header value
 */
export function compressedJsonResponse(data: CompressedJson, request: Request, cacheControl: string): Response {
	const acceptsBr = request.headers.get('accept-encoding')?.includes('br');
	return new Response(acceptsBr ? (data.br as BodyInit) : data.json, {
		headers: {
			'cache-control': cacheControl,
			'content-type': 'application/json',
			vary: 'Accept-Encoding',
			...(acceptsBr ? { 'content-encoding': 'br' } : {})
		}
	});
}
