import type { TokenDetails } from '$lib/explorer/token-client.js';
import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ params, fetch, setHeaders }) {
	const { chain, token: address } = params;

	// Cache the token data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test.
	// stale-while-revalidate lets the edge serve a cached copy instantly (then
	// refresh in the background) for the long tail of rarely-hit token URLs,
	// which avoids a cold SSR round-trip dominating mobile LCP.
	setHeaders({
		'cache-control': 'public, max-age=1800, stale-while-revalidate=86400' // 30 min fresh, 1 day stale
	});

	const token = await fetchPublicApi<TokenDetails>(fetch, 'token/details', { chain_slug: chain, address });
	return { token };
}
