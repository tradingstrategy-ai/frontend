/**
 * Fetch the server logs on the page load.
 */
import { publicApiError } from '$lib/helpers/public-api';
import { configuredStrategies } from 'trade-executor/strategy/configuration';

export async function load({ params, fetch }) {
	const strategy = configuredStrategies.get(params.strategy)!;

	const resp = await fetch(`${strategy.url}/logs`);
	if (!resp.ok) throw await publicApiError(resp);

	return {
		logs: await resp.json()
	};
}
