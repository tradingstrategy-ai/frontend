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
	const baseUrl = 'https://app.uniswap.org/tokens/';
	const path = `./${chainSlug}/${tokenAddress}`;
	const url = new URL(path, baseUrl);
	url.searchParams.set('chain', chainSlug);
	return url.toString();
}
