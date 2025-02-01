// TODO: move vault-specific methods to vault adapter
import type { TokenInfo, TokenBalance } from './schemas/token';
import { isAddressEqual } from 'viem';
import { type Config } from '@wagmi/core';
import { getTokenInfo } from './helpers';

export type AssetWithdrawl = {
	asset: Address;
	target: Address;
	amount: bigint;
};

export type AssetWithdrawlEvent = {
	eventName: 'AssetWithdrawn';
	args: AssetWithdrawl;
};

type GetRedemptionParams = {
	withdrawl: AssetWithdrawl;
	denominationToken: TokenInfo;
	chainId: number;
};

/**
 * Get token data for a given AssetWithdrawl and return merged asset/token data.
 */
export async function getRedemption(config: Config, params: GetRedemptionParams) {
	const { withdrawl, denominationToken, chainId } = params;
	const { asset: address, amount: value } = withdrawl;
	const { decimals, symbol, label } = isAddressEqual(address, denominationToken.address)
		? denominationToken
		: await getTokenInfo(config, { address, chainId });

	return {
		address,
		decimals,
		symbol,
		label,
		value
	} as TokenBalance;
}
