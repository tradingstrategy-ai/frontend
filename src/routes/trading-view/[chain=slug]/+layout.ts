import { error } from '@sveltejs/kit';
import { chainsUnderMaintenance } from '$lib/config';
import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ fetch, params }) {
	const chain_slug = params.chain;

	// trigger error if chain is under maintenance
	const chainName = chainsUnderMaintenance[chain_slug];
	if (chainName) {
		error(503, { chainName, message: `Chain under maintenance: ${chainName}` });
	}

	return {
		chain: await fetchPublicApi(fetch, 'chain-details', { chain_slug })
	};
}
