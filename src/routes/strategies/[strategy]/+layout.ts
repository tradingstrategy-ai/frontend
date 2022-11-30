import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';
import { getStrategyMetadata } from 'trade-executor-frontend/strategy/metadata';

export const load: LayoutLoad = async ({ params, fetch }) => {
	const strategy = getConfiguredStrategyById(params.strategy);
	if (!strategy) throw error(404, 'Not found');

	let resp;
	try {
		resp = await fetch(`${strategy.url}/state`);
	} catch (e) {
		throw error(503, { message: 'Service Unavailable', stack: e.message });
	}

	// TODO: rename chain/getApiError and use it here
	if (!resp.ok) throw error(503, resp.statusText);

	return {
		summary: getStrategyMetadata(strategy, fetch),
		state: resp.json()
	};
};
