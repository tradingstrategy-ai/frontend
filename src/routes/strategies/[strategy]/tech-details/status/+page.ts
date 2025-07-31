/**
 * Fetch the instance status metadta.
 */
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { configuredStrategies } from 'trade-executor/schemas/configuration';
import { type RunState, runStateSchema } from 'trade-executor/schemas/run-state';

export async function load({ params, fetch }) {
	const strategy = configuredStrategies.get(params.strategy)!;

	let runState: RunState;

	try {
		const resp = await fetch(`${strategy.url}/status`);
		if (!resp.ok) throw await publicApiError(resp);
		runState = runStateSchema.parse(await resp.json());
	} catch (e) {
		const stack = [`Error loading data from URL: ${strategy.url}/status`, e.message];
		error(503, { message: 'Service Unavailable', stack });
	}

	return { runState };
}
