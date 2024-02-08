import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
export async function load({ fetch, params }) {
	return await fetchPublicApi(fetch, 'exchanges', { chain_slug: params.chain });
}
