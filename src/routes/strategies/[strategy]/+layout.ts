/**
 * Fetch data needed to render the strategy frame and all subpages.
 */
import { error } from '@sveltejs/kit';
import { configuredStrategies } from 'trade-executor/schemas/configuration';
import { getStrategyInfo, type ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
import { getStrategyState } from 'trade-executor/state';
import { getChain } from '$lib/helpers/chain';

export async function load({ params, fetch }) {
	const strategyConf = configuredStrategies.get(params.strategy);
	if (!strategyConf) error(404, 'Not found');

	// kick off slow `/state` request before awaiting metadata (returned as deferred promise)
	const state = getStrategyState(fetch, params.strategy).catch((e) => {
		console.error(`Error loading or parsing ${params.strategy} /state endpoint`);
		console.error(e);
	});

	let strategy: ConnectedStrategyInfo;

	try {
		strategy = await getStrategyInfo(fetch, strategyConf);
	} catch (e) {
		console.error(e);
		const stack = [
			`Error loading or parsing data from URL: ${strategyConf.url}/metadata`,
			e instanceof Error ? (e.stack ?? e.message) : String(e)
		];
		error(503, { message: 'Service Unavailable', stack });
	}

	const chain = getChain(strategy.on_chain_data.chain_id)!;

	return {
		chain,
		strategy,
		deferred: { state }
	};
}
