import type { PageLoad } from '../$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchanges
const apiUrl = `${backendUrl}/exchanges`;

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return resp.json();
};
