/**
 * Fetch data needed to render the strategy frame and all subpages.
 */
import { error } from '@sveltejs/kit';
import { getStrategyRuntimeState, type ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getStrategyState } from 'trade-executor/state';
import { getChain } from '$lib/wallet/client.js';

export async function load({ params, fetch }) {
	const state = getStrategyState(fetch, params.strategy).catch(() => {});

	let strategy: ConnectedStrategyRuntimeState | undefined;

	try {
		strategy = await getStrategyRuntimeState(fetch, params.strategy);
	} catch (e) {
		console.error(e);
		const stack = [`Error loading or parsing data from ${params.strategy}/metadata`];
		if (e instanceof Error) {
			stack.push(e.stack ?? e.message);
		} else {
			stack.push(String(e));
		}
		throw error(503, { message: 'Service Unavailable', stack });
	}

	if (!strategy) throw error(404, 'Not found');

	const chain = getChain(strategy.on_chain_data.chain_id);

	return {
		chain,
		strategy,
		deferred: { state }
	};
}
