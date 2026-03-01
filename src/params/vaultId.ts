/**
 * Match chain-specific vault ID formats:
 * - EVM chains (Ethereum, Polygon, Arbitrum, Base, etc.): `${chainId}-0x${address}`
 * - HyperCore / GRVT (chain 325): `${chainId}-vlt:${id}`
 * - Lighter (chain 9998): `${chainId}-lighter-pool-${id}`
 *
 * To add a new format, append a new alternative to the regex group.
 */
export function match(param: string) {
	return /^\d+-(0x[0-9a-f]+|vlt:[0-9a-z]+|lighter-pool-\d+)$/i.test(param);
}
