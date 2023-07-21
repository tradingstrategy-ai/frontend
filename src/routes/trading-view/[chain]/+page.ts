import { fetchPublicApi } from '$lib/helpers/public-api';
import { fetchTokens } from '$lib/explorer/token-client.js';

export async function load({ params, fetch }) {
	const chain_slug = params.chain;

	return {
		streamed: {
			exchanges: fetchTopExchanges(fetch, chain_slug),
			tokens: fetchTopTokens(fetch, chain_slug)
		}
	};
}

async function fetchTopExchanges(fetch: Fetch, chain_slug: string) {
	const data = await fetchPublicApi(fetch, 'exchanges', {
		chain_slug,
		sort: 'usd_volume_30d',
		direction: 'desc',
		filter_zero_volume: 'true'
	});

	return data.exchanges.slice(0, 5);
}

async function fetchTopTokens(fetch: Fetch, chain_slug: string) {
	const data = await fetchTokens(fetch, {
		chain_slug,
		sort: 'liquidity_latest',
		page_size: 20
	});
	return data?.rows.slice(0, 5) ?? [];
}
