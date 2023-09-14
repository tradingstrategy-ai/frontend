export async function load({ fetch }) {
	// Load prerendered chain data and make it available site-wide
	const resp = await fetch('/data/chains');
	const chains = await resp.json();

	// Convert to chainInfo object that can be dereferenced by id or slug
	const chainInfo: Record<string, ChainInfo> = {};
	for (const chain of chains) {
		Object.defineProperties(chainInfo, {
			[chain.slug]: { value: chain, enumerable: true },
			[chain.id]: { value: chain }
		});
	}

	return { chainInfo };
}
