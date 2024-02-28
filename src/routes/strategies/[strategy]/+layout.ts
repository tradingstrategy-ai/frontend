/**
 * Fetch data needed to render the strategy frame and all subpages.
 */
import { error } from '@sveltejs/kit';
import { getStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getStrategyState } from 'trade-executor/state';
import { getChain } from '$lib/wallet/client.js';

export async function load({ params, fetch }) {
	const strategy = await getStrategyRuntimeState(fetch, params.strategy);
	const state = getStrategyState(fetch, params.strategy).catch(() => {});

	if (!strategy) {
		throw error(404, 'Not found');
	} else if (!strategy.connected) {
		throw error(503, 'Service Unavailable');
	}

	const chainId = strategy.on_chain_data.chain_id;
	const chain = getChain(chainId);
	if (!chain) {
		const stack = [`Error: chain ${chainId} is not configured in wallet client.`];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	return {
		chain,
		strategy,
		deferred: { state }
	};
}
