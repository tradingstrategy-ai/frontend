import { error } from '@sveltejs/kit';
import { getChain, getChainsBySlug } from '$lib/helpers/chain';

export async function load({ params, parent }) {
	const chainSlug = params.chain;
	const chain = getChain(chainSlug);

	if (!chain) error(404, 'Chain not found');

	const { topVaults } = await parent();

	// Include vaults from all chains sharing this slug (e.g. HyperEVM + HyperCore)
	const chainIds = new Set(getChainsBySlug(chain.slug).map((c) => c.id));

	const vaults = topVaults.vaults.filter((vault) => {
		return chainIds.has(vault.chain_id);
	});

	return {
		chain,
		chainSlug,
		chainName: chain.name,
		topVaults: { ...topVaults, vaults }
	};
}
