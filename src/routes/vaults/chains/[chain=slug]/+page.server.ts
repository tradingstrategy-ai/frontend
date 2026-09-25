import { error, redirect } from '@sveltejs/kit';
import { getChain } from '$lib/helpers/chain';
import { loadVaultListing } from '$lib/server/top-vaults/listing';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function load({ params, fetch, url }) {
	const chainSlug = params.chain;
	// ApeX's chain and protocol are one and the same, so this special rule avoids maintaining two copies of the page.
	if (chainSlug === 'apex') redirect(301, '/vaults/protocols/apex');

	const chain = getChain(chainSlug);

	if (!chain) error(404, 'Chain not found');

	const listing = await loadVaultListing(fetch, url, 'chain', chainSlug);
	// A protocol with the chain's name (Hyperliquid, Lighter …) has its own hub, which is the
	// landing page for "<name> vaults"; this chain hub then describes everything on the chain.
	const hasSameNameProtocol = (await getCachedTopVaults(fetch)).vaults.some(
		(vault) => vault.protocol_slug === chainSlug
	);

	return {
		chain,
		chainSlug,
		chainName: chain.name,
		hasSameNameProtocol,
		...listing
	};
}
