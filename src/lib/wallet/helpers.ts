/**
 * Return URL for purchasing native currency for a given chain
 */
export function buyNativeCurrencyUrl(chainId: number): string | undefined {
	const urls: Record<number, string> = {
		1: 'https://ethereum.org/en/get-eth/',
		137: 'https://wallet.polygon.technology/polygon/gas-swap',
		42161: 'https://bridge.arbitrum.io/?destinationChain=arbitrum-one&sourceChain=ethereum'
	};

	return urls[chainId];
}

/**
 * Return URL for Uniswap v3 "swap" page to purchase tokens
 *
 * @param chain - chain slug ('ethereum', 'arbitrum', etc.)
 * @param outputCurrency - address for desired ERC-20 token
 */
export function buyTokenUrl(chain: string, outputCurrency: Address) {
	const baseUrl = 'https://app.uniswap.org/swap';
	const params = new URLSearchParams({ chain, outputCurrency });
	return `${baseUrl}?${params}`;
}
