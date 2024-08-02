import type { LendingReserveDocument } from '$lib/search/trading-entities';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { searchCollection } from '$lib/search/typesense-client.js';

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
	const { chain, token } = params;

	// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
	// pages are served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	return {
		token: await fetchPublicApi(fetch, 'token/details', { chain_slug: chain, address: token }),
		reserves: await searchLendingReserves(fetch, chain, token)
	};
}
