/**
 * The performance information is stored as the part of the state.
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

	return {};
};
