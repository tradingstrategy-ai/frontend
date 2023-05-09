import { error } from '@sveltejs/kit';
import { fetchPublicApi, publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';
import { getStrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';

// FIXME: temporary hack; remove once `chainId` has been added to `metadata`
function getChainId({ portfolio }: any) {
	const position = Object.values(portfolio?.closed_positions)[0];
	return position?.reserve_currency?.chain_id;
}

export async function load({ params, fetch }) {
	const strategy = getConfiguredStrategyById(params.strategy);
	if (!strategy) throw error(404, 'Not found');

	const url = `${strategy.url}/state`;
	let resp;
	try {
		resp = await fetch(url);
	} catch (e) {
		const stack = [`Error loading data from URL: ${url}`, e.message];
		throw error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	// FIXME: temporary hack; remove once `chainId` has been added to `metadata`
	const state = await resp.json();
	const chain_id = getChainId(state);

	return {
		chain: chain_id && fetchPublicApi(fetch, 'chain-details', { chain_id }),
		strategy,
		summary: getStrategyRuntimeState(strategy, fetch),
		state
	};
}
