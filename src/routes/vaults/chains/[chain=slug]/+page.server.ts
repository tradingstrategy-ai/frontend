import { error } from '@sveltejs/kit';
import { getChain, getChainsBySlug } from '$lib/helpers/chain';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getInlineVaultListing } from '$lib/top-vaults/inline-data';

export async function load({ params, fetch }) {
	const chainSlug = params.chain;
	const chain = getChain(chainSlug);

	if (!chain) error(404, 'Chain not found');

	const topVaults = await getCachedTopVaults(fetch);
	const chainIds = new Set(getChainsBySlug(chainSlug).map((item) => item.id));
	const chainVaults = topVaults.vaults.filter((vault) => chainIds.has(vault.chain_id));

	return {
		chain,
		chainSlug,
		chainName: chain.name,
		totalVaultCount: topVaults.vaults.length,
		initialTopVaults: getInlineVaultListing(topVaults, chainVaults)
	};
}
