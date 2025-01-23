// TODO: move vault-specific methods to vault adapter
import type { TokenInfo, TokenBalance } from './schemas/token';
import { formatUnits, isAddressEqual } from 'viem';
import { type Config, simulateContract } from '@wagmi/core';
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

type GetSharePriceParams = {
	calculator: Address;
	vault: Address;
	denominationToken: { decimals: number };
};

/**
 * Custom error thrown when getSharePrice fails
 */
class GetSharePriceError extends Error {
	constructor(cause: any) {
		super('Error fetching share price');
		this.name = 'GetSharePriceError';
		this.cause = cause;
	}
}

/**
 * Get the current share price for a given vault
 */
export async function getSharePrice(config: Config, params: GetSharePriceParams) {
	const { default: abi } = await import('$lib/trade-executor/vaults/enzyme/abi/FundValueCalculator.json');

	const { calculator, vault, denominationToken } = params;

	let value: bigint;

	try {
		const { result } = await simulateContract(config, {
			abi,
			address: calculator,
			functionName: 'calcGrossShareValue',
			args: [vault]
		});
		value = result[1];
	} catch (e) {
		throw new GetSharePriceError(e);
	}

	return Number(formatUnits(value, denominationToken.decimals));
}
