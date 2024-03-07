import type { Chain as WalletChain } from 'viem';

// TODO: move to zod schema in lib/schemas
export type ApiChain = {
	chain_id: number;
	chain_slug: string;
	chain_name: string;
	chain_explorer?: string;
};

export const chains = [
	{ id: 1, slug: 'ethereum', name: 'Ethereum' },
	{ id: 56, slug: 'binance', name: 'BNB Smart Chain' },
	{ id: 137, slug: 'polygon', name: 'Polygon' },
	{ id: 43114, slug: 'avalanche', name: 'Avalanche C-chain' },
	{ id: 42161, slug: 'arbitrum', name: 'Arbitrum One' }
] as const;

export type Chain = (typeof chains)[number];

/**
 * Get a chain by id or slug
 */
export function getChain(identifier: Maybe<number | string>) {
	return chains.find(({ id, slug }) => id === identifier || slug === identifier);
}

/**
 * Extract explorer URL from either wallet (viem) Chain object and append address or transaction path
 */
export function getExplorerUrl(chain: Maybe<WalletChain>, hash: Address) {
	const baseUrl = chain?.blockExplorers?.default?.url ?? 'https://blockscan.com';

	let path = '';
	if (hash.length === 42) {
		path = `/address/${hash}`;
	} else if (hash.length === 66) {
		path = `/tx/${hash}`;
	}
	return `${baseUrl}${path}`;
}
