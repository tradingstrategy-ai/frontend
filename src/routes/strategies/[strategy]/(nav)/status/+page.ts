/**
 * Fetch the instance status metadta.
 */
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';

export const load = (async ({ parent, fetch }) => {
	const { strategy } = await parent();

	const url = `${strategy.url}/status`;
	let resp;
	try {
		resp = await fetch(url);
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		runState: resp.json()
	};
}) satisfies PageLoad;
