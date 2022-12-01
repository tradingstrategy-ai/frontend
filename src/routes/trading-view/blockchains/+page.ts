import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
const apiUrl = `${backendUrl}/chains`;

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		chains: await resp.json()
	};
};
