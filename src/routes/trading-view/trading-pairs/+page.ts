import type { PageLoad } from '../$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

// https://tradingstrategy.ai/api/explorer/#/Trading%20pair/web_pairs
const apiUrl = `${backendUrl}/pairs`;

export const load: PageLoad = async () => {
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		pairs: resp.json()
	};
};
