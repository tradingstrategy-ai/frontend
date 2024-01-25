import type { Abi, Log } from 'viem';
import type { Config, GetBalanceParameters, GetBalanceReturnType } from '@wagmi/core';
import { decodeEventLog, formatUnits, isAddressEqual, parseAbi, erc20Abi } from 'viem';
import { getBalance, multicall } from '@wagmi/core';
import { formatNumber } from '$lib/helpers/formatters';

/**
 * Extract events from transaction logs
 */
export function getEvents(logs: Log[], abi: Abi, name: string, contractAddress: Address) {
	return logs
		.filter(({ address }: Log) => isAddressEqual(address, contractAddress))
		.map(({ data, topics }: Log) => decodeEventLog({ abi, data, topics, eventName: name }))
		.filter(({ eventName }) => eventName === name);
}

/**
 * Format BigInt value to string based on value and decimals properties
 * uses formatNumber if optional minDigits/maxPrecision are provided
 */
export function formatBalance({ value, decimals }: GetBalanceReturnType, minDigits?: number, maxPrecision?: number) {
	const formatted = formatUnits(value, decimals);
	return minDigits === undefined ? formatted : formatNumber(formatted, minDigits, maxPrecision);
}

// additional token ABI functions to get EIP712 version info if available
const tokenVersionAbi = parseAbi([
	'function version() view returns (string)',
	'function EIP712_VERSION() view returns (string)'
]);

export type TokenInfo = {
	address: Address;
	decimals: number;
	name: string | undefined;
	symbol: string | undefined;
	version: string;
};

/**
 * Get info about an ERC20 token.
 *
 * Includes non-standard `version` property which is needed to support EIP712
 * typed signed messages (for delegated ERC20 transfers).
 */
export async function getTokenInfo(
	config: Config,
	{ address, chainId }: { address: Address; chainId?: number | undefined }
): Promise<TokenInfo> {
	const abi = [...erc20Abi, ...tokenVersionAbi];
	const functionNames = ['decimals', 'name', 'symbol', 'version', 'EIP712_VERSION'] as const;

	const response = await multicall(config, {
		contracts: functionNames.map((functionName) => ({ address, abi, chainId, functionName }))
	});

	const [decimals, name, symbol, version, eip712version] = response.map(({ result }) => result);

	return {
		address,
		decimals,
		name,
		symbol,
		version: version ?? eip712version ?? '1'
	} as TokenInfo;
}

export type GetTokenBalanceReturnType = GetBalanceReturnType & { address: Address };

/**
 * Wrapper around @wagmi getBalance that includes token address in the returned object
 */
export async function getTokenBalance(
	config: Config,
	parameters: GetBalanceParameters & {
		token: Address;
	}
): Promise<GetTokenBalanceReturnType> {
	const balance = await getBalance(config, parameters);
	return {
		...balance,
		address: parameters.token
	};
}
