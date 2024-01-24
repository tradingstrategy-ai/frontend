import type { Abi, Log } from 'viem';
import type { GetBalanceReturnType } from '@wagmi/core';
import { decodeEventLog, formatUnits, isAddressEqual } from 'viem';
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
