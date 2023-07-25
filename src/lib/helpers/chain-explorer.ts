import type { Chain as WalletChain } from '@wagmi/core';

type ApiChain = {
	chain_id: number;
	chain_slug: string;
	chain_name: string;
	chain_explorer: string;
};

type WalletOrApiChain = Record<string, any> & (WalletChain | ApiChain);

const fallbackExplorer = 'https://blockscan.com';

/**
 * Extract explorer URL from either wagmi or API Chain object and append address or transaction path
 */
export function getExplorerUrl(chain: WalletOrApiChain, hash: Address) {
	const baseUrl = chain.chain_explorer ?? chain.blockExplorers?.default?.url ?? fallbackExplorer;

	let path = '';
	if (hash.length === 42) {
		path = `/address/${hash}`;
	} else if (hash.length === 66) {
		path = `/tx/${hash}`;
	}
	return `${baseUrl}${path}`;
}
