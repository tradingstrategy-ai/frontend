/**
 * Fetch the server logs ont he page load.
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

	console.log('Loading logs from:', webhookUrl);

	const apiUrl = `${webhookUrl}/logs`;
	const resp = await fetch(apiUrl);

	if (!resp.ok) {
		throw error(500, `Error loading ${apiUrl}: ${resp.statusText}`);
	}

	const logs = await resp.json();

	console.log('Loaded', logs.length, 'log messages');

	return {
		logs: logs
	};
};
