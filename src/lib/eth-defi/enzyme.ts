import { formatUnits, isAddressEqual } from 'viem';
import type { Config, GetBalanceReturnType } from '@wagmi/core';
import type { GetTokenBalanceReturnType } from '$lib/wallet';
import { getTokenInfo } from './helpers';

export type AssetWithdrawl = {
	asset: Address;
	target: Address;
	amount: bigint;
};

type GetRedemptionParams = {
	withdrawl: AssetWithdrawl;
	denominationToken: GetTokenBalanceReturnType;
	chainId: number;
};

/**
 * Get token data for a given AssetWithdrawl and return merged asset/token data.
 */
export async function getRedemption(config: Config, params: GetRedemptionParams) {
	const { withdrawl, denominationToken, chainId } = params;
	const { asset: address, amount: value } = withdrawl;
	const { decimals, symbol } = isAddressEqual(address, denominationToken.address)
		? denominationToken
		: await getTokenInfo(config, { address, chainId });

	return {
		decimals,
		symbol,
		value,
		// TODO: remove deprecated `formatted` property after @wagmi removes from GetBalanceReturnType
		formatted: formatUnits(value, decimals)
	} as GetBalanceReturnType;
}
