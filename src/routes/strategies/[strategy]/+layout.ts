/**
 * Fetch data needed to render the strategy frame and all subpages.
 */
import { error } from '@sveltejs/kit';
import { configuredStrategies } from 'trade-executor/strategy/configuration.js';
import { getStrategyRuntimeState, type ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getStrategyState } from 'trade-executor/state';
import { getChain } from '$lib/wallet/client.js';

export async function load({ params, fetch }) {
	const strategyConf = configuredStrategies.get(params.strategy);
	if (!strategyConf) error(404, 'Not found');

	// kick off slow `/state` request before awaiting metadata (returned as deferred promise)
	const state = getStrategyState(fetch, params.strategy).catch((e) => {
		console.error(`Error loading or parsing ${params.strategy} /state endpoint`);
		console.error(e);
	});

	let strategy: ConnectedStrategyRuntimeState;

	try {
		strategy = await getStrategyRuntimeState(fetch, strategyConf);
	} catch (e) {
		console.error(e);
		const stack = [
			`Error loading or parsing data from URL: ${strategyConf.url}/metadata`,
			e instanceof Error ? (e.stack ?? e.message) : String(e)
		];
		error(503, { message: 'Service Unavailable', stack });
	}

	const chain = getChain(strategy.on_chain_data.chain_id);

	return {
		chain,
		strategy,
		deferred: { state }
	};
}
