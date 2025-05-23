/**
 * Fetch the source code page.
 */
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { configuredStrategies } from 'trade-executor/schemas/configuration';

export async function load({ params, fetch }) {
	const strategy = configuredStrategies.get(params.strategy);
	if (!strategy) error(404, 'Not found');

	let resp;
	try {
		resp = await fetch(`${strategy.url}/source`);
	} catch (e) {
		const stack = [`Error loading data from URL: ${strategy.url}/source`, e.message];
		error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) throw await publicApiError(resp);

	return {
		code: await resp.text()
	};
}
