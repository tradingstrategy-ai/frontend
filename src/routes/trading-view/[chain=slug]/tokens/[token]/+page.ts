import type { LendingReserveDocument } from '$lib/search/trading-entities';
import type { TokenDetails } from '$lib/explorer/token-client.js';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { searchCollection } from '$lib/search/typesense-client';

// Use search index to find lending reserves for the given token
async function searchLendingReserves(fetch: Fetch, chain: string, address: string) {
	try {
		const resp = await searchCollection<LendingReserveDocument>(fetch, 'trading-entities', {
			q: '',
			query_by: ['description'],
			filter_by: ['type:lending_reserve', `blockchain:${chain}`, `smart_contract_addresses:${address}`]
		});
		return resp?.hits?.map((h) => h.document) ?? ([] as LendingReserveDocument[]);
	} catch (e) {
		console.error(`Error searching lending reserves for ${chain} token: ${address}`);
		console.error(e);
	}
}

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

	// These two requests are independent (the reserve search keys off the URL
	// address, not the token/details response), so fetch them in parallel rather
	// than as a waterfall — the SSR response, and therefore the LCP heading,
	// is gated by the slower of the two instead of their sum.
	const [token, reserves] = await Promise.all([
		fetchPublicApi<TokenDetails>(fetch, 'token/details', { chain_slug: chain, address }),
		searchLendingReserves(fetch, chain, address)
	]);

	return { token, reserves };
}
