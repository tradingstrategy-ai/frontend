import type { State } from './interface';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from '../strategy/configuration';

export async function getStrategyState(fetch: Fetch, strategyId: string) {
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

	return resp.json() as Promise<State>;
}
