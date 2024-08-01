/**
 * Return URL for purchasing native currency for a given chain
 */
export function buyNativeCurrencyUrl(chainId: number): string | undefined {
	const urls: Record<number, string> = {
		1: 'https://ethereum.org/en/get-eth/',
		137: 'https://wallet.polygon.technology/polygon/gas-swap'
	};

	return urls[chainId];
}

/**
 * Return URL for Uniswap v3 page to purchase tokens
 */
export function buyTokenUrl(chainSlug: string, tokenAddress: Address) {
	const baseUrl = 'https://app.uniswap.org/tokens';
	return `${baseUrl}/${chainSlug}/${tokenAddress}?chain=${chainSlug}`;
}
