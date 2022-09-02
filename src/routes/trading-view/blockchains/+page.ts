import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { backendUrl } from '$lib/config';

// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
const apiUrl = `${backendUrl}/chains`;

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw error(500, `Error loading ${apiUrl}: ${resp.statusText}`);
	}

	return {
		chains: await resp.json()
	};
};
