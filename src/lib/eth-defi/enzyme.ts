// NOTE: wagmi functions below depend on '$lib/wallet/client' initialization
import { fetchToken, prepareWriteContract } from '@wagmi/core';
import { formatUnits } from 'viem';
import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';

export async function getAccountNetValue({ vault, fund_value_calculator }: Contracts, account: Address) {
	const { result } = await prepareWriteContract({
		address: fund_value_calculator,
		abi: fundValueCalculatorABI,
		functionName: 'calcNetValueForSharesHolder',
		args: [vault, account]
	});

	const [address, value] = result as [Address, bigint];
	const { decimals, symbol } = await fetchToken({ address });

	return { decimals, symbol, value, formatted: formatUnits(value, decimals) };
}
