import type { Address, Chain } from '@wagmi/core';

const fallbackExplorer = 'https://blockscan.com';

/**
 * Extract explorer URL from wagmi Chain object and append address path
 */
export function getExplorerUrl(chain: Chain, address: Address) {
	const baseUrl = chain?.blockExplorers?.default?.url ?? fallbackExplorer;
	return `${baseUrl}/address/${address}`;
}

/**
 * Return the USDC ERC-20 contract address by chain id
 */
export function getUsdcAddress(chainId: number) {
	// prettier-ignore
	switch (chainId) {
		case     1: return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // Ethereum
		case    56: return '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'; // BNB Smart Chain
		case   137: return '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'; // Polygon
		case 42161: return '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'; // Arbitrum One
		case 43114: return '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'; // Avalanche C-chain
	}
}

/**
 * Return the Enzyme FundValueCalculator contract address by chain id
 * See: https://docs.enzyme.finance/developers/contracts
 */
export function getFundValueCalculatorAddress(chainId: number): Maybe<Address> {
	// prettier-ignore
	switch (chainId) {
		case   1: return '0x490e64E0690b4aa481Fb02255aED3d052Bad7BF1'; // Ethereum
		case 137: return '0xcdf038Dd3b66506d2e5378aee185b2f0084B7A33'; // Polygon
	}
}
