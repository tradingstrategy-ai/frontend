/**
 * Fetch the server logs on the page load.
 */
import type { PageLoad } from './$types';
import { publicApiError } from '$lib/helpers/publicApiError';

export const load: PageLoad = async ({ params, parent, fetch }) => {
	const { strategy } = await parent();

	const resp = await fetch(`${strategy.url}/logs`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		logs: resp.json()
	};
};
