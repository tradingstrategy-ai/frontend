import { formatUnits, isAddressEqual } from 'viem';
import { type Config, simulateContract } from '@wagmi/core';
import { type GetTokenBalanceReturnType, getTokenInfo } from './helpers';
import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';

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
	const { decimals, symbol, label } = isAddressEqual(address, denominationToken.address)
		? denominationToken
		: await getTokenInfo(config, { address, chainId });

	return {
		address,
		decimals,
		symbol,
		label,
		value,
		// TODO: remove deprecated `formatted` property after @wagmi removes from GetBalanceReturnType
		formatted: formatUnits(value, decimals)
	} as GetTokenBalanceReturnType;
}

type GetSharePriceParams = {
	calculator: Address;
	vault: Address;
	denominationToken: GetTokenBalanceReturnType;
};

/**
 * Get the current share price for a given vault
 */
export async function getSharePrice(config: Config, params: GetSharePriceParams) {
	const { calculator, vault, denominationToken } = params;

	const { result } = await simulateContract(config, {
		abi: fundValueCalculatorABI,
		address: calculator,
		functionName: 'calcGrossShareValue',
		args: [vault]
	});

	const value = result[1];

	if (value === undefined) {
		throw new Error('failed to fetch sharePrice');
	}

	return Number(formatUnits(value, denominationToken.decimals));
}
