/**
 * Fetch data needed to render the strategy frame and all subpages.
 */
import { error } from '@sveltejs/kit';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { getStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getStrategyState } from 'trade-executor/state';

export async function load({ params, fetch }) {
	const state = getStrategyState(fetch, params.strategy);

	const strategy = await getStrategyRuntimeState(fetch, params.strategy);

	if (!strategy) {
		throw error(404, 'Not found');
	} else if (!strategy.connected) {
		throw error(503, 'Service Unavailable');
	}

	const chain = await fetchPublicApi(fetch, 'chain-details', {
		chain_id: strategy.on_chain_data.chain_id.toString()
	});

	return {
		chain,
		strategy,
		state: await state
	};
}
