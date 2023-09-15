import type { ApiChain } from '$lib/helpers/chain.js';

export async function load({ fetch }) {
	// Load prerendered chain data and make it available site-wide
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

	return { chainInfo };
}
