/**
 * Fetch data needed to render the strategy frame and all subpages.
 */
import { error } from '@sveltejs/kit';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';
import { getStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
import { getStrategyState } from 'trade-executor/state';

export async function load({ params, fetch }) {
	const strategy = getConfiguredStrategyById(params.strategy);
	if (!strategy) throw error(404, 'Not found');

	const state = getStrategyState(fetch, strategy.id);
	const summary = await getStrategyRuntimeState(strategy, fetch);
	const chain_id = summary?.on_chain_data?.chain_id;
	const chain = fetchPublicApi(fetch, 'chain-details', { chain_id });

	return { chain, strategy, summary, state };
}
