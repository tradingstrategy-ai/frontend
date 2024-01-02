import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from '../strategy/configuration';
import { stateSchema } from './state';

export async function getStrategyState(fetch: Fetch, strategyId: string, raw = false) {
	const strategy = getConfiguredStrategyById(strategyId);
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

	const rawPayload = await resp.json();
	return raw ? rawPayload : stateSchema.parse(rawPayload);
}
