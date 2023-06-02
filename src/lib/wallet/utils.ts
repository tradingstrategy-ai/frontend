import type { Chain } from '@wagmi/core';

const fallbackExplorer = 'https://blockscan.com';

/**
 * Extract explorer URL from wagmi Chain object and append address path
 */
export function getExplorerUrl(chain: Chain, address: Address) {
	const baseUrl = chain?.blockExplorers?.default?.url ?? fallbackExplorer;
	return `${baseUrl}/address/${address}`;
}
