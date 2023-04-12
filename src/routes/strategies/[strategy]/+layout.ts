import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';
import { getStrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';

export async function load({ params, fetch }) {
	const strategy = getConfiguredStrategyById(params.strategy);
	if (!strategy) throw error(404, 'Not found');

	const url = `${strategy.url}/state`;
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
		strategy,
		summary: getStrategyRuntimeState(strategy, fetch),
		state: resp.json()
	};
}
