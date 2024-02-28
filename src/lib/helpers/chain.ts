import type { Chain as WalletChain } from 'viem';

export type ApiChain = {
	chain_id: number;
	chain_slug: string;
	chain_name: string;
	chain_explorer?: string;
};

const fallbackExplorer = 'https://blockscan.com';

/**
 * Extract explorer URL from either wallet (viem) Chain object and append address or transaction path
 */
export function getExplorerUrl(chain: WalletChain, hash: Address) {
	const baseUrl = chain.blockExplorers?.default?.url ?? fallbackExplorer;

	let path = '';
	if (hash.length === 42) {
		path = `/address/${hash}`;
	} else if (hash.length === 66) {
		path = `/tx/${hash}`;
	}
	return `${baseUrl}${path}`;
}
