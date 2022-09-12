import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import getApiError from '$lib/chain/getApiError';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
const apiUrl = `${backendUrl}/exchange-details`;

export const load: PageLoad = async ({ params, fetch }) => {
	const exchange_slug = params.exchange;
	const chain_slug = params.chain;

	const encoded = new URLSearchParams({ exchange_slug, chain_slug });
	const resp = await fetch(`${apiUrl}?${encoded}`);

	if (!resp.ok) {
		throw getApiError(resp, 'Exchange', [chain_slug, exchange_slug]);
	}

	return resp.json();
};
