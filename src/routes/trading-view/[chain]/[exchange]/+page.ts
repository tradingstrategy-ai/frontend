import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
export async function load({ params, fetch }) {
	const exchange_slug = params.exchange;
	const chain_slug = params.chain;

	return {
		exchange: fetchPublicApi(fetch, 'exchange-details', { exchange_slug, chain_slug })
	};
}
