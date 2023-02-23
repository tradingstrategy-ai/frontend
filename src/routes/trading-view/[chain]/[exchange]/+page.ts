import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
const apiUrl = `${backendUrl}/exchange-details`;

export const load = (async ({ params, fetch }) => {
	const exchange_slug = params.exchange;
	const chain_slug = params.chain;

	const encoded = new URLSearchParams({ exchange_slug, chain_slug });
	const resp = await fetch(`${apiUrl}?${encoded}`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return resp.json();
}) satisfies PageLoad;
