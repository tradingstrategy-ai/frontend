/**
 * Fetch the instance status metadta.
 */
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { configuredStrategies } from 'trade-executor/strategy/configuration';

export async function load({ params, fetch }) {
	const strategy = configuredStrategies.get(params.strategy);

	if (!strategy) throw error(404, 'Not found');

	let resp;
	try {
		resp = await fetch(`${strategy.url}/status`);
	} catch (e) {
		const stack = [`Error loading data from URL: ${strategy.url}/status`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		runState: resp.json()
	};
}
