import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
export async function load({ fetch }) {
	return fetchPublicApi(fetch, 'exchanges');
}
