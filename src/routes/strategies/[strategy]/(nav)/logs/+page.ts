/**
 * Fetch the server logs on the page load.
 */
import { publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';

export async function load({ params, fetch }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	const resp = await fetch(`${url}/logs`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		logs: resp.json()
	};
}
