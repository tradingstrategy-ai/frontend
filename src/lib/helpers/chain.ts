// TODO: move to zod schema in lib/schemas
export type ApiChain = {
	chain_id: number;
	chain_slug: string;
	chain_name: string;
	chain_explorer?: string;
};

// Local cache of supported chains (helps limit API calls)
export const chains = [
	{ id: 1, slug: 'ethereum', name: 'Ethereum', explorer: 'https://etherscan.io', gas: 'ETH' },
	{ id: 56, slug: 'binance', name: 'BNB Smart Chain', explorer: 'https://bscscan.com', gas: 'BNB' },
	{ id: 137, slug: 'polygon', name: 'Polygon', explorer: 'https://polygonscan.com', gas: 'POL' },
	{ id: 8453, slug: 'base', name: 'Base', explorer: 'https://basescan.org', gas: 'ETH' },
	{ id: 43114, slug: 'avalanche', name: 'Avalanche C-chain', explorer: 'https://snowtrace.io', gas: 'AVAX' },
	{ id: 42161, slug: 'arbitrum', name: 'Arbitrum One', explorer: 'https://arbiscan.io', gas: 'ETH' },
	{ id: 80094, slug: 'berachain', name: 'Berachain', explorer: 'https://berascan.com', gas: 'BERA' },
	{ id: 130, slug: 'unichain', name: 'Unichain', explorer: 'https://unichain.blockscout.com', gas: 'ETH' }
] as const;

export type Chain = (typeof chains)[number];

/**
 * Get a chain by id or slug
 */
export function getChain(identifier: Maybe<number | string>) {
	return chains.find(({ id, slug }) => id === identifier || slug === identifier);
}

/**
 * Extract explorer URL from Chain object and append address or transaction path
 */
export function getExplorerUrl(chain: Maybe<Chain>, hash: Address) {
	const baseUrl = chain?.explorer ?? 'https://blockscan.com';

	let path = '';
	if (hash.length === 42) {
		path = `/address/${hash}`;
	} else if (hash.length === 66) {
		path = `/tx/${hash}`;
	}
	return `${baseUrl}${path}`;
}
