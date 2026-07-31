import { error, redirect } from '@sveltejs/kit';
import { getChain } from '$lib/helpers/chain';
import { loadVaultListing } from '$lib/server/top-vaults/listing';

export async function load({ params, fetch, url }) {
	const chainSlug = params.chain;
	// ApeX's chain and protocol are one and the same, so this special rule avoids maintaining two copies of the page.
	if (chainSlug === 'apex') redirect(301, '/vaults/protocols/apex');

	const chain = getChain(chainSlug);

	if (!chain) error(404, 'Chain not found');

	const listing = await loadVaultListing(fetch, url, 'chain', chainSlug);

	return {
		chain,
		chainSlug,
		chainName: chain.name,
		...listing
	};
}
