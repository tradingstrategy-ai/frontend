import type { Abi, DecodeEventLogReturnType, Log } from 'viem';
import { decodeEventLog, isAddressEqual } from 'viem';

/**
 * Extract events from transaction logs
 */
export function getEvents(logs: Log[], abi: Abi, name: string, contractAddress: Address) {
	return logs
		.filter(({ address }: Log) => isAddressEqual(address, contractAddress))
		.map(({ data, topics }: Log) => decodeEventLog({ abi, data, topics }))
		.filter(({ eventName }: DecodeEventLogReturnType) => eventName === name);
}
