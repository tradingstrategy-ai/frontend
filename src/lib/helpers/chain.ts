// TODO: move to zod schema in lib/schemas
export type ApiChain = {
	chain_id: number;
	chain_slug: string;
	chain_name: string;
	chain_explorer?: string;
};

// Local cache of supported chains (helps limit API calls)
export const chains = [
	// Fully supported chains (indexed on Oracle)
	{ id: 1, slug: 'ethereum', name: 'Ethereum', explorer: 'https://etherscan.io', gas: 'ETH' },
	{ id: 56, slug: 'binance', name: 'BNB Smart Chain', explorer: 'https://bscscan.com', gas: 'BNB' },
	{ id: 130, slug: 'unichain', name: 'Unichain', explorer: 'https://unichain.blockscout.com', gas: 'ETH' },
	{ id: 137, slug: 'polygon', name: 'Polygon', explorer: 'https://polygonscan.com', gas: 'POL' },
	{ id: 8453, slug: 'base', name: 'Base', explorer: 'https://basescan.org', gas: 'ETH' },
	{ id: 42161, slug: 'arbitrum', name: 'Arbitrum One', explorer: 'https://arbiscan.io', gas: 'ETH' },
	{ id: 43114, slug: 'avalanche', name: 'Avalanche C-chain', explorer: 'https://snowtrace.io', gas: 'AVAX' },
	{ id: 80094, slug: 'berachain', name: 'Berachain', explorer: 'https://berascan.com', gas: 'BERA' },
	// Partially supported chains (indexed vaults, logos)
	{ id: 10, slug: 'optimism', name: 'Optimism', explorer: 'https://explorer.optimism.io', gas: 'ETH' },
	{ id: 100, slug: 'gnosis', name: 'Gnosis', explorer: 'https://gnosisscan.io', gas: 'XDAI' },
	{ id: 146, slug: 'sonic', name: 'Sonic', explorer: 'https://sonicscan.org', gas: 'S' },
	{ id: 999, slug: 'hyperliquid', name: 'Hyperliquid', explorer: 'https://app.hyperliquid.xyz', gas: 'HYPE' },
	{ id: 1868, slug: 'soneium', name: 'Soneium', explorer: 'https://soneium.blockscout.com', gas: 'ETH' },
	{ id: 9745, slug: 'plasma', name: 'Plasma', explorer: 'https://plasmascan.to', gas: 'XLP' },
	{ id: 34443, slug: 'mode', name: 'Mode', explorer: 'https://modescan.io', gas: 'ETH' },
	{ id: 43111, slug: 'hemi', name: 'Hemi', explorer: 'https://explorer.hemi.xyz', gas: 'ETH' },
	{ id: 59144, slug: 'linea', name: 'Linea', explorer: 'https://lineascan.build', gas: 'ETH' },
	{ id: 81457, slug: 'blast', name: 'Blast', explorer: 'https://blastscan.io', gas: 'ETH' },
	{ id: 747474, slug: 'katana', name: 'Katana', explorer: 'https://katanascan.com', gas: 'ETH' }
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
