export interface Chain {
	chain_id: number;
	chain_slug: string;
	chain_name: string;
}

/**
 * Find a chain by id or slug
 */
export function getChain(chains: Chain[], chain: string | number) {
	return chains.find((c) => chain === c.chain_id || chain === c.chain_slug);
}

/**
 * Return chain slug from an id (if exists)
 */
export function getChainSlug(chains: Chain[], id: number) {
	return getChain(chains, id)?.chain_slug;
}

/**
 * Return chain name from an id or slug (if exists)
 */
export function getChainName(chains: Chain[], chain: string | number) {
	return getChain(chains, chain)?.chain_name;
}
