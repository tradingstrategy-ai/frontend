/**
 * Helpers for exchange account strategies (e.g., GMX, Derive).
 *
 * Provides URL builders and display names for linking to external exchange
 * account views from strategy and position pages.
 */

const exchangeUrls: Record<string, (address: string) => string> = {
	gmx: (address) => `https://app.gmx.io/#/accounts/${address}`,
	derive: (address) => `https://explorer.derive.xyz/address/${address}`
};

const exchangeNames: Record<string, string> = {
	gmx: 'GMX',
	derive: 'Derive'
};

/**
 * Build the external URL for viewing an exchange account.
 *
 * @param protocol - exchange protocol identifier (e.g., "gmx", "derive")
 * @param address - the on-chain address (typically the safe address)
 */
export function getExchangeAccountUrl(protocol: string, address: string): string | undefined {
	return exchangeUrls[protocol]?.(address);
}

/**
 * Get the human-readable display name for an exchange protocol.
 *
 * @param protocol - exchange protocol identifier (e.g., "gmx", "derive")
 */
export function getExchangeDisplayName(protocol: string): string {
	return exchangeNames[protocol] ?? protocol.charAt(0).toUpperCase() + protocol.slice(1);
}

const TAG_PREFIX = 'exchange_account_strategy_';

/**
 * Extract the exchange protocol from strategy tags.
 *
 * Looks for tags matching `exchange_account_strategy_{protocol}` (e.g.,
 * `exchange_account_strategy_gmx`, `exchange_account_strategy_derive`).
 */
export function getExchangeProtocolFromTags(tags: string[]): string | undefined {
	const tag = tags.find((t) => t.startsWith(TAG_PREFIX));
	return tag?.slice(TAG_PREFIX.length);
}
