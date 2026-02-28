/**
 * Match chain-specific vault ID formats:
 * - EVM chains (Ethereum, Polygon, Arbitrum, Base, etc.): `${chainId}-0x${address}`
 * - HyperCore (chain 325): `${chainId}-vlt:${id}`
 *
 * To add a new format, append a new alternative to the regex group.
 */
export function match(param: string) {
	return /^\d+-(0x[0-9a-f]+|vlt:[0-9a-z]+)$/i.test(param);
}
