import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const load = (async ({ fetch, params, parent }) => {
	const { position: id, status } = params;
	const { state } = await parent();

	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const position = state.portfolio[`${status}_positions`][id];

	if (!position) {
		throw error(404, 'Not found');
	}

	const chain_id = position.pair?.base?.chain_id;
	let chain;

	if (chain_id) {
		chain = fetchPublicApi(fetch, 'chain-details', { chain_id }).catch((e) => {
			console.error(`Error fetching chain details: ${e}`);
		});
	}

	return {
		breadcrumbs: { [id]: `Position #${id}` },
		chain,
		position,
		status
	};
}) satisfies LayoutLoad;
