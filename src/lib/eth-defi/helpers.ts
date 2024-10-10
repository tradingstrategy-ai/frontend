import type { Abi, Log } from 'viem';
import type { Config, GetBalanceParameters, GetBalanceReturnType } from '@wagmi/core';
import { decodeEventLog, formatUnits, isAddressEqual, parseAbi, erc20Abi } from 'viem';
import { readContract, readContracts, simulateContract, writeContract } from '@wagmi/core';
import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
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
export function formatBalance(
	{ value, decimals }: { value: bigint; decimals: number },
	minDigits?: number,
	maxPrecision?: number
) {
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
	label: string | undefined;
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

	const response = await readContracts(config, {
		contracts: functionNames.map((functionName) => ({ address, abi, chainId, functionName }))
	});

	const [decimals, name, symbol, version, eip712version] = response.map(({ result }) => result);
	const label = getTokenLabel(symbol as string | undefined, address);
	return {
		address,
		decimals,
		name,
		symbol,
		label,
		version: version ?? eip712version ?? '1'
	} as TokenInfo;
}

export type GetTokenBalanceParameters = Omit<GetBalanceParameters, 'unit'> & { token: Address };
export type GetTokenBalanceReturnType = Omit<GetBalanceReturnType, 'formatted'> & {
	address: Address;
	label: string;
};

/**
 * Get token balance for a given address
 *
 * Similar API as @wagmi/core getBalance:
 * - additional `token` param for ERC20 token address
 * - return object includes additional `address` property
 */
export async function getTokenBalance(
	config: Config,
	parameters: GetTokenBalanceParameters
): Promise<GetTokenBalanceReturnType> {
	const { token, address, ...contractParams } = parameters;
	const contract = { address: token, abi: erc20Abi, ...contractParams };

	const response = await readContracts(config, {
		contracts: [
			{ ...contract, functionName: 'decimals' },
			{ ...contract, functionName: 'symbol' },
			{ ...contract, functionName: 'balanceOf', args: [address] }
		]
	});

	const [decimals, symbol, value] = response.map(({ result }) => result);
	const label = getTokenLabel(symbol as string | undefined, token);
	return { address: token, decimals, symbol, label, value } as GetTokenBalanceReturnType;
}

export function isBridgedUSDC(address: Address) {
	const bridgedUSDC = [
		'0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // Polygon
		'0xff970a61a04b1ca14834a43f5de4533ebddb5cc8' // Arbitrum One
	];
	return bridgedUSDC.includes(address.toLowerCase());
}

export function getTokenLabel(symbol: string | undefined, address: Address) {
	return symbol === 'USDC' && isBridgedUSDC(address) ? 'USDC.e' : symbol;
}

/**
 * Get a strategy denomination token address for a given chain and comptroller
 */
export async function getDenominationAsset(
	config: Config,
	{ chainId, comptroller }: { chainId?: number; comptroller: Address }
) {
	return readContract(config, {
		chainId,
		address: comptroller,
		abi: comptrollerABI,
		functionName: 'getDenominationAsset'
	}) as Promise<Address>;
}

/**
 * Get strategy denomination token info for a given chain and comptroller
 */
export async function getDenominationTokenInfo(
	config: Config,
	{ chainId, comptroller }: { chainId?: number; comptroller: Address }
) {
	const address = await getDenominationAsset(config, { chainId, comptroller });
	return getTokenInfo(config, { chainId, address });
}

/**
 * Get strategy denomination token balance for a given chain, comptroller and address
 */
export async function getDenominationTokenBalance(
	config: Config,
	{ chainId, comptroller, address }: { chainId?: number; comptroller: Address; address: Address }
) {
	const token = await getDenominationAsset(config, { chainId, comptroller });
	return getTokenBalance(config, { chainId, token, address });
}

type ApproveTokenTransferParams = {
	chainId?: number;
	address: Address;
	spender: Address;
	value: number | bigint;
};

export async function approveTokenTransfer(
	config: Config,
	{ chainId, address, spender, value }: ApproveTokenTransferParams
) {
	const { request } = await simulateContract(config, {
		abi: erc20Abi,
		chainId,
		address,
		functionName: 'approve',
		args: [spender, BigInt(value)]
	});

	return writeContract(config, request);
}

type GetTokenAllowanceParams = {
	chainId?: number;
	address: Address;
	owner: Address;
	spender: Address;
};

export function getTokenAllowance(config: Config, { chainId, address, owner, spender }: GetTokenAllowanceParams) {
	return readContract(config, {
		abi: erc20Abi,
		chainId,
		address,
		functionName: 'allowance',
		args: [owner, spender]
	});
}

/**
 * Return expected block time for a given chain. This is used to display a "best guess" progress
 * bar for transactions. The times returned are about double the average block times, plus added
 * time for HTTP latency. This results in a conservative but reasonable estimate.
 */
export function getExpectedBlockTime(chainId: number) {
	// prettier-ignore
	switch (chainId) {
		case     1 : return 25_000; // Ethereum
 		case   137 : return 5_000;  // Polygon
		case 42161 : return 2_500;  // Arbitrum
    default    : return 10_000; // everything else
	}
}

export type ErrorInfo = {
	name: string;
	message: string;
	shortMessage: string | undefined;
	details: string | undefined;
	functionName: string | undefined;
	state: string | undefined;
	cause: ErrorInfo | unknown | undefined;
};

/**
 * Extract an ErrorInfo object from an error. This enables errors to be serialized
 * (for example, in $wizard.data). Key properties are extracted that are useful for
 * displaying appropriate error messages in the UI. An optional state (of an fsm)
 * may also be included.
 *
 * Extrated data includes common Error properties as well as some custom properties
 * available on [viem errors](https://github.com/wevm/viem/blob/main/src/errors/base.ts).
 */
export function extractErrorInfo(error: unknown, state?: string | undefined): ErrorInfo | unknown {
	if (!(error instanceof Error)) return error;

	const { name, message, shortMessage, details, functionName } = error as any;
	const cause = extractErrorInfo(error.cause);
	return { name, message, shortMessage, details, functionName, state, cause };
}
