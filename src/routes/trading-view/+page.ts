import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';

export const load = (async ({ fetch }) => {
	const resp = await fetch(`${backendUrl}/impressive-numbers`);

	// render the page even if the backend is down
	if (!resp.ok) {
		console.error(`API error: ${resp.status} ${resp.statusText}`);
		return {};
	}

	return resp.json();
}) satisfies PageLoad;
