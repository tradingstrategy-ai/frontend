import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

const apiUrl = `${backendUrl}/datasets`;

export const load = (async ({ fetch }) => {
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		datasets: await resp.json()
	};
}) satisfies PageLoad;
