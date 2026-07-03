import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const compress = promisify(brotliCompress);

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// This cache stores the already-serialised and Brotli-compressed listing payload.
// The original production symptom was a transient split-brain between the vault
// listing and an individual vault detail page:
// - /trading-view/vaults?q=Peter%20Schiff showed a 1M annualised return above 100%.
// - /trading-view/vaults/systemic-strategies-peter-schiff-s-vault showed -23%.
// By the time this was investigated, production had converged and both views
// showed -23.3%, with the source data reporting one_month_cagr_net
// -0.23331116202113666.
// The likely failure mode is that this endpoint had its own compressed payload
// cache, while detail SSR read getCachedTopVaults() directly. If the upstream
// top-vault export changed between those cache refreshes, the listing could keep
// serving an older compressed JSON string even after the detail page had newer
// vault data.
let brCache: { generatedAt: string; json: string; br: Uint8Array; expires: number; created: number } | null = null;

async function getCachedAllData(fetch: Fetch) {
	const now = Date.now();
	const topVaults = await getCachedTopVaults(fetch);
	const generatedAt = new Date(topVaults.generated_at).toISOString();

	// Version the compressed response by the backend dataset timestamp, not just
	// by wall-clock TTL. If getCachedTopVaults() has advanced to a new export,
	// this endpoint must not keep returning a stale compressed body from the
	// previous export, because listing pages consume this endpoint while detail
	// pages consume getCachedTopVaults() through SSR.
	if (brCache && brCache.generatedAt === generatedAt && now < brCache.expires) return brCache;

	const jsonStr = JSON.stringify(topVaults);
	const br = new Uint8Array(
		await compress(new TextEncoder().encode(jsonStr), {
			params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
		})
	);

	brCache = { generatedAt, json: jsonStr, br, expires: now + CACHE_TTL_MS, created: now };
	return brCache;
}

const cacheHeaders = {
	// Do not rely on query-string cache keys for correctness. Cloudflare/R2 can
	// normalise or strip query parameters for the underlying export, so the
	// listing API uses a short HTTP freshness window and lets the client compare
	// the response generated_at against the SSR layout generatedAt. Only a proven
	// stale mismatch triggers a heavier cache: 'reload' retry.
	'cache-control': 'public, max-age=300, stale-while-revalidate=300',
	'content-type': 'application/json',
	vary: 'Accept-Encoding'
};

export async function GET({ fetch, request }) {
	const data = await getCachedAllData(fetch);
	const acceptsBr = request.headers.get('accept-encoding')?.includes('br');
	// These headers are intentionally public diagnostics. Future mismatch
	// reports need to compare the listing payload version, its cache age, and the
	// detail page SSR payload version without guessing which cache layer served
	// each response.
	const diagnosticHeaders = {
		'x-top-vaults-generated-at': data.generatedAt,
		'x-top-vaults-source': '/top-vaults/all-data',
		'x-top-vaults-cache-age-seconds': Math.floor((Date.now() - data.created) / 1000).toString()
	};

	if (acceptsBr) {
		return new Response(data.br as BodyInit, {
			headers: { ...cacheHeaders, ...diagnosticHeaders, 'content-encoding': 'br' }
		});
	}

	return new Response(data.json, { headers: { ...cacheHeaders, ...diagnosticHeaders } });
}
