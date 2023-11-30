/**
 * Fetch the source code page.
 */
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';

export async function load({ params, fetch }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	let resp;
	try {
		resp = await fetch(`${url}/source`);
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}/source`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return {
		code: resp.text()
	};
}
