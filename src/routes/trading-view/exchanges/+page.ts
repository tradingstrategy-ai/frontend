import type { ExchangeIndexResponse } from '$lib/helpers/exchange.js';
import { fetchPublicApi } from '$lib/helpers/public-api';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
export async function load({ fetch }) {
	return await fetchPublicApi<ExchangeIndexResponse>(fetch, 'exchanges');
}
