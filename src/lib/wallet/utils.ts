import type { Chain } from '@wagmi/core';

const fallbackExplorer = 'https://blockscan.com';

/**
 * Extract explorer URL from wagmi Chain object and append address or transaction path
 */
export function getExplorerUrl(chain: Chain, addressOrTx: Address) {
	const baseUrl = chain?.blockExplorers?.default?.url ?? fallbackExplorer;
	let path = '';
	if (addressOrTx.length === 42) {
		path = `/address/${addressOrTx}`;
	} else if (addressOrTx.length === 66) {
		path = `/tx/${addressOrTx}`;
	}
	return `${baseUrl}${path}`;
}
