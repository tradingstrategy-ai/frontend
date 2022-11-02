import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import getApiError from '$lib/chain/getApiError';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
const apiUrl = `${backendUrl}/chain-details`;

export const load: PageLoad = async ({ params, fetch }) => {
	const encoded = new URLSearchParams({ chain_slug: params.chain });
	const resp = await fetch(`${apiUrl}?${encoded}`);

	if (!resp.ok) {
		throw await getApiError(resp);
	}

	return resp.json();
};
