import { error } from '@sveltejs/kit';
import { chainsUnderMaintenance } from '$lib/config';
import { getChain } from '$lib/helpers/chain.js';

export async function load({ params }) {
	const { chain: chainSlug } = params;

	// trigger error if chain is under maintenance
	const chainName = chainsUnderMaintenance[chainSlug];
	if (chainName) {
		error(503, { chainName, message: `Chain under maintenance: ${chainName}` });
	}

	const chain = getChain(chainSlug);

	if (!chain) {
		error(404, `Chain not found: ${chainSlug}`);
	}

	return { chain };
}
