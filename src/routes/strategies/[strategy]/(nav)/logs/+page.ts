/**
 * Fetch the server logs on the page load.
 */
import { publicApiError } from '$lib/helpers/public-api';

export async function load({ parent, fetch }) {
	const { strategy } = await parent();

	const resp = await fetch(`${strategy.url}/logs`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		logs: resp.json()
	};
}
