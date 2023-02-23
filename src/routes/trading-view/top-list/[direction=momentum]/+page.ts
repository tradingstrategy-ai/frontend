import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

const apiUrl = `${backendUrl}/top-momentum`;

export const load = (async ({ params, fetch }) => {
	const direction: 'up' | 'down' = params.direction === 'daily-up' ? 'up' : 'down';

	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	const data = await resp.json();

	return {
		direction,
		pairs: data[`top_${direction}_24h_min_liq_1m`]
	};
}) satisfies PageLoad;
