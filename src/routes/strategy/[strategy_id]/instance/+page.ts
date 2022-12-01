/**
 * Fetch the instance status metadta.
 */
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';

export const load: PageLoad = async ({ params, fetch }) => {
	const strategy = getConfiguredStrategyById(params.strategy_id);
	if (!strategy) {
		throw error(500, `Strategy not loaded: ${params.strategy_id}`);
	}
	const webhookUrl = strategy.url;

	const apiUrl = `${webhookUrl}/status`;
	let resp = null;
	try {
		resp = await fetch(apiUrl);
	} catch (e) {
		// Be little more helpful for the developer
		// because Svelte fetch() error messages lack any context
		// CORS error: No 'Access-Control-Allow-Origin' header is present on the requested resource
		console.error('fetch() error:', e);
		throw e;
	}

	if (!resp.ok) {
		throw error(500, `Error loading ${apiUrl}: ${resp.statusText}`);
	}

	const runState = await resp.json();

	console.log('Instance state', runState);

	return {
		runState: runState
	};
};
