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

/**
 * Return URL for purchasing native currency for a given chain
 */
export function buyNativeCurrencyUrl(chainId: number) {
	// Polygon
	if (chainId === 137) {
		return 'https://wallet.polygon.technology/polygon/gas-swap';
	}
}

/**
 * Return URL for Uniswap v3 page to purchase tokens
 */
export function buyTokenUrl(chainSlug: string, tokenAddress: Address) {
	const baseUrl = 'https://app.uniswap.org/#/tokens';
	return `${baseUrl}/${chainSlug}/${tokenAddress}`;
}
