import { formatUnits, isAddressEqual } from 'viem';
import { type FetchTokenResult, type FetchBalanceResult, fetchToken } from '@wagmi/core';

export interface AssetWithdrawl {
	asset: Address;
	amount: bigint;
}

/**
 * Get token data for a given AssetWithdrawl and return merged asset/token data.
 */
export async function getRedemption(withdrawl: AssetWithdrawl, denominationToken: FetchTokenResult, chainId: number) {
	const { asset: address, amount: value } = withdrawl;
	const { decimals, symbol } = isAddressEqual(address, denominationToken.address)
		? denominationToken
		: await fetchToken({ address, chainId });
	return { decimals, symbol, value, formatted: formatUnits(value, decimals) } as FetchBalanceResult;
}
