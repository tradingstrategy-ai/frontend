import { error } from '@sveltejs/kit';
import { fetchPublicApi, publicApiError } from '$lib/helpers/public-api';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';
import { getStrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';

async function fetchStrategyState(fetch: Fetch, strategyUrl: string) {
	const url = `${strategyUrl}/state`;
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

	return resp.json();
}

export async function load({ params, fetch }) {
	const strategy = getConfiguredStrategyById(params.strategy);
	if (!strategy) throw error(404, 'Not found');

	const summary = await getStrategyRuntimeState(strategy, fetch);
	const chain_id = summary.on_chain_data.chain_id;
	const chain = fetchPublicApi(fetch, 'chain-details', { chain_id });
	const state = fetchStrategyState(fetch, strategy.url);

	return { chain, strategy, summary, state };
}
