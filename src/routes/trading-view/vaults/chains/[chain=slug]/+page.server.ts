import { error } from '@sveltejs/kit';
import { getChain } from '$lib/helpers/chain';

export async function load({ params }) {
	const chainSlug = params.chain;
	const chain = getChain(chainSlug);

	if (!chain) error(404, 'Chain not found');

	return {
		chain,
		chainSlug,
		chainName: chain.name
	};
}
