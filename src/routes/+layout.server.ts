import type { ApiChain } from '$lib/helpers/chain.js';

export async function load({ fetch, locals }) {
	// Load chain lookup data and make it available site-wide
	const resp = await fetch('/data/chains');
	const chains = await resp.json();

	// Convert to chainInfo object that can be dereferenced by id or slug
	const chainInfo: Record<string, ApiChain> = {};
	for (const chain of chains) {
		Object.defineProperties(chainInfo, {
			[chain.chain_slug]: { value: chain, enumerable: true },
			[chain.chain_id]: { value: chain }
		});
	}

	// Make admin and ipCountry available to all layouts/pages
	const { admin, ipCountry } = locals;

	return { admin, ipCountry, chainInfo };
}
