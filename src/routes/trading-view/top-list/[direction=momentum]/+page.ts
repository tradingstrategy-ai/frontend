import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/config';

const apiUrl = `${backendUrl}/top-momentum`;

export const load: PageLoad = async ({ params, fetch }) => {
	const direction: 'up' | 'down' = params.direction === 'daily-up' ? 'up' : 'down';

	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw error(500, `Error loading ${apiUrl}: ${resp.statusText}`);
	}

	const data = await resp.json();

	return {
		direction,
		pairs: data[`top_${direction}_24h_min_liq_1m`]
	};
};
