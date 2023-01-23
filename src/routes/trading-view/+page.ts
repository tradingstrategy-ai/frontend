import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';

const apiUrl = `${backendUrl}/impressive-numbers`;

export const load: PageLoad = async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	// render the page even if the backend is down
	if (!resp.ok) {
		console.error(`API error: ${resp.status} ${resp.statusText}`);
		return {};
	}

	return resp.json();
};
