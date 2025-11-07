import type { ExchangeIndexResponse } from '$lib/helpers/exchange.js';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { error } from '@sveltejs/kit';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
export async function load({ fetch, parent }) {
	const { chain } = await parent();
	if (!chain.hasBackendData) error(404, 'Not Found');

	return await fetchPublicApi<ExchangeIndexResponse>(fetch, 'exchanges', { chain_slug: chain.slug });
}
