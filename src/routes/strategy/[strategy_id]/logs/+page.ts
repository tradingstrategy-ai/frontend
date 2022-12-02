/**
 * Fetch the server logs on the page load.
 */
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/publicApiError';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';

export const load: PageLoad = async ({ params, fetch }) => {
	const strategy = getConfiguredStrategyById(params.strategy_id);
	if (!strategy) {
		throw error(500, `Strategy not loaded: ${params.strategy_id}`);
	}

	const resp = await fetch(`${strategy.url}/logs`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		logs: resp.json()
	};
};
