import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { chainsUnderMaintenance } from '$lib/config';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const load = (({ fetch, params }) => {
	const chain_slug = params.chain;

	// trigger error if chain is under maintenance
	const chainName = chainsUnderMaintenance[chain_slug];
	if (chainName) {
		throw error(503, { chainName, message: `Chain under maintenance: ${chainName}` });
	}

	return {
		chain: fetchPublicApi(fetch, 'chain-details', { chain_slug })
	};
}) satisfies LayoutLoad;
