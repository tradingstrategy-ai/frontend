import type { Config, GetBalanceParameters, GetBalanceReturnType } from '@wagmi/core';
import { getBalance } from '@wagmi/core';

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

/**
 * Wrapper around @wagmi getBalance that includes token address
 * in the returned object
 */
export async function getTokenBalance(
	config: Config,
	parameters: GetBalanceParameters & {
		token: Address;
	}
) {
	const balance = await getBalance(config, parameters);
	return {
		...balance,
		address: parameters.token
	};
}

export type GetTokenBalanceReturnType = GetBalanceReturnType & { address: Address };
