type ChainData = {
	id: number;
	slug: string;
	name: string;
	homepage: string;
	explorer: string;
	nativeCurrency: string;
	hasBackendData: boolean;
	sortOrder?: number;
};

// Local registry of supported chains
export const chains = (() => {
	const arr = [
		// Fully supported chains (indexed on oracle / backend data)
		// Current sort order: arbitrum, base, ethereum, avalanche, polygon, binance, berachain, unichain
		{
			id: 1,
			slug: 'ethereum',
			name: 'Ethereum',
			homepage: 'https://ethereum.org',
			explorer: 'https://etherscan.io',
			nativeCurrency: 'ETH',
			hasBackendData: true,
			sortOrder: 3
		},
		{
			id: 56,
			slug: 'binance',
			name: 'BNB Smart Chain',
			homepage: 'https://www.bnbchain.org',
			explorer: 'https://bscscan.com',
			nativeCurrency: 'BNB',
			hasBackendData: true,
			sortOrder: 6
		},
		{
			id: 130,
			slug: 'unichain',
			name: 'Unichain',
			homepage: 'https://unichain.org',
			explorer: 'https://uniscan.xyz',
			nativeCurrency: 'ETH',
			hasBackendData: true,
			sortOrder: 8
		},
		{
			id: 137,
			slug: 'polygon',
			name: 'Polygon',
			homepage: 'https://polygon.technology',
			explorer: 'https://polygonscan.com',
			nativeCurrency: 'POL',
			hasBackendData: true,
			sortOrder: 5
		},
		{
			id: 8453,
			slug: 'base',
			name: 'Base',
			homepage: 'https://base.org',
			explorer: 'https://basescan.org',
			nativeCurrency: 'ETH',
			hasBackendData: true,
			sortOrder: 2
		},
		{
			id: 42161,
			slug: 'arbitrum',
			name: 'Arbitrum One',
			homepage: 'https://arbitrum.io',
			explorer: 'https://arbiscan.io',
			nativeCurrency: 'ETH',
			hasBackendData: true,
			sortOrder: 1
		},
		{
			id: 43114,
			slug: 'avalanche',
			name: 'Avalanche C-chain',
			homepage: 'https://www.avax.network',
			explorer: 'https://snowtrace.io',
			nativeCurrency: 'AVAX',
			hasBackendData: true,
			sortOrder: 4
		},
		{
			id: 80094,
			slug: 'berachain',
			name: 'Berachain',
			homepage: 'https://www.berachain.com',
			explorer: 'https://berascan.com',
			nativeCurrency: 'BERA',
			hasBackendData: true,
			sortOrder: 7
		},
		// Partially supported chains (indexed vaults, logos)
		{
			id: 10,
			slug: 'optimism',
			name: 'Optimism',
			homepage: 'https://www.optimism.io/',
			explorer: 'https://explorer.optimism.io',
			nativeCurrency: 'ETH',
			hasBackendData: false
		},
		{
			id: 100,
			slug: 'gnosis',
			name: 'Gnosis',
			homepage: 'https://www.gnosis.io/',
			explorer: 'https://gnosisscan.io',
			nativeCurrency: 'XDAI',
			hasBackendData: false
		},
		{
			id: 146,
			slug: 'sonic',
			name: 'Sonic',
			homepage: 'https://www.soniclabs.com/',
			explorer: 'https://sonicscan.org',
			nativeCurrency: 'S',
			hasBackendData: false
		},
		{
			id: 999,
			slug: 'hyperliquid',
			name: 'Hyperliquid',
			homepage: 'https://hyperfoundation.org',
			explorer: 'https://app.hyperliquid.xyz',
			nativeCurrency: 'HYPE',
			hasBackendData: false
		},
		{
			id: 1868,
			slug: 'soneium',
			name: 'Soneium',
			homepage: 'https://soneium.org',
			explorer: 'https://soneium.blockscout.com',
			nativeCurrency: 'ETH',
			hasBackendData: false
		},
		{
			id: 9745,
			slug: 'plasma',
			name: 'Plasma',
			homepage: 'https://www.plasma.to/',
			explorer: 'https://plasmascan.to',
			nativeCurrency: 'XLP',
			hasBackendData: false
		},
		{
			id: 34443,
			slug: 'mode',
			name: 'Mode',
			homepage: 'https://www.mode.network',
			explorer: 'https://modescan.io',
			nativeCurrency: 'ETH',
			hasBackendData: false
		},
		{
			id: 43111,
			slug: 'hemi',
			name: 'Hemi',
			homepage: 'ttps://hemi.xyz',
			explorer: 'https://explorer.hemi.xyz',
			nativeCurrency: 'ETH',
			hasBackendData: false
		},
		{
			id: 59144,
			slug: 'linea',
			name: 'Linea',
			homepage: 'https://linea.build',
			explorer: 'https://lineascan.build',
			nativeCurrency: 'ETH',
			hasBackendData: false
		},
		{
			id: 81457,
			slug: 'blast',
			name: 'Blast',
			homepage: 'https://blast.io',
			explorer: 'https://blastscan.io',
			nativeCurrency: 'ETH',
			hasBackendData: false
		},
		{
			id: 747474,
			slug: 'katana',
			name: 'Katana',
			homepage: 'https://katana.network',
			explorer: 'https://katanascan.com',
			nativeCurrency: 'ETH',
			hasBackendData: false
		}
	] as const satisfies ChainData[];

	// sort chains by sortOrder if present, falling back to alphabetical by name
	return arr.toSorted((a: ChainData, b: ChainData) => {
		const aOrder = a.sortOrder ?? Infinity;
		const bOrder = b.sortOrder ?? Infinity;
		if (aOrder !== bOrder) return aOrder - bOrder;
		return a.name.localeCompare(b.name);
	});
})();

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
