/**
 * Fetch the source code page.
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

	const url = `${strategy.url}/source`;
	let resp = null;
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
		source: resp.text()
	};
};
