import { fetchPublicApi } from '$lib/helpers/public-api';
import { fetchTokens } from '$lib/explorer/token-client.js';
import { fetchPairs } from '$lib/explorer/pair-client.js';
import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client.js';

export async function load({ params, fetch }) {
	const chain_slug = params.chain;

	return {
		streamed: {
			exchanges: fetchTopExchanges(fetch, chain_slug),
			tokens: fetchTopTokens(fetch, chain_slug),
			pairs: fetchTopPairs(fetch, chain_slug),
			reserves: fetchTopReserves(fetch, chain_slug)
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
	// Using larger page_size due to but in tokens endpoint
	// see: https://github.com/tradingstrategy-ai/backend/issues/189
	const data = await fetchTokens(fetch, {
		chain_slug,
		sort: 'liquidity_latest',
		page_size: 20
	});
	return data?.rows.slice(0, 5) ?? [];
}

async function fetchTopPairs(fetch: Fetch, chain_slugs: string) {
	const data = await fetchPairs(fetch, {
		chain_slugs,
		page_size: 5
	});
	return data?.rows ?? [];
}

async function fetchTopReserves(fetch: Fetch, chain_slug: string) {
	const data = await fetchLendingReserves(fetch, {
		chain_slug,
		page_size: 5
	});
	return data?.rows ?? [];
}
