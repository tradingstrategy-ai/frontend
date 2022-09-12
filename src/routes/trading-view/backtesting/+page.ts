import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/config';

const apiUrl = `${backendUrl}/datasets`;

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw error(500, `Error loading ${apiUrl}: ${resp.statusText}`);
	}

	return {
		datasets: await resp.json()
	};
};
