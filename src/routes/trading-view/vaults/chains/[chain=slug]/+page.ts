import { error } from '@sveltejs/kit';
import { getChain } from '$lib/helpers/chain';

export async function load({ params, parent }) {
	const chainSlug = params.chain;
	const chain = getChain(chainSlug);

	if (!chain) error(404, 'Chain not found');

	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return vault.chain_id === chain.id;
	});

	return {
		chain,
		chainSlug,
		chainName: chain.name,
		topVaults: { ...topVaults, vaults }
	};
}
