/**
 * Helpers for exchange account strategies (e.g., GMX, Derive, Hyperliquid).
 *
 * Provides URL builders and display names for linking to external exchange
 * account views from strategy and position pages.
 */
import type { Portfolio } from '../schemas/portfolio';
import type { OnChainData } from '../schemas/summary';

const exchangeUrls: Record<string, (address: string) => string> = {
	gmx: (address) => `https://app.gmx.io/#/accounts/${address}`,
	derive: (address) => `https://explorer.derive.xyz/address/${address}`,
	hyperliquid: (address) => `https://app.hyperliquid.xyz/vaults/${address}`
};

const exchangeNames: Record<string, string> = {
	gmx: 'GMX',
	derive: 'Derive',
	hyperliquid: 'Hyperliquid'
};

/** Position statuses viewable on each exchange's external page. */
const exchangeVisiblePositions: Record<string, Set<string>> = {
	gmx: new Set(['open']),
	derive: new Set(['open', 'closed']),
	hyperliquid: new Set(['open', 'closed'])
};

export type ExchangeAccountInfo = { url: string; name: string; protocol: string };

/**
 * Check whether an exchange supports viewing a given position status.
 *
 * GMX, for example, only shows open positions on its external page.
 */
export function exchangeSupportsPositionStatus(protocol: string, status: string): boolean {
	return exchangeVisiblePositions[protocol]?.has(status) ?? true;
}

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

/**
 * Extract the exchange protocol from portfolio positions.
 *
 * Checks open positions (falling back to closed) for an `exchange_account`
 * pair kind and returns the `exchange_protocol` from `other_data`.
 */
export function getExchangeProtocolFromPortfolio(portfolio: Portfolio): string | undefined {
	const allPositions = { ...portfolio.open_positions, ...portfolio.closed_positions };
	for (const position of Object.values(allPositions)) {
		if (position.pair.kind === 'exchange_account') {
			return position.pair.other_data?.exchange_protocol as string | undefined;
		}
	}
}

/**
 * Resolve the on-chain address used for exchange account URLs.
 */
function getExchangeAddress(onChainData: OnChainData): string | undefined {
	if (onChainData.asset_management_mode === 'lagoon') {
		return onChainData.smart_contracts.safe;
	}
}

/**
 * Build exchange account info from a known protocol and on-chain data.
 */
function buildExchangeAccountInfo(protocol: string, onChainData: OnChainData): ExchangeAccountInfo | undefined {
	const address = getExchangeAddress(onChainData);
	if (!address) return undefined;

	const url = getExchangeAccountUrl(protocol, address);
	if (!url) return undefined;

	return { url, name: getExchangeDisplayName(protocol), protocol };
}

/**
 * Resolve exchange account info from strategy tags and on-chain data.
 *
 * Detects the exchange protocol from strategy tags. Returns undefined if
 * the strategy is not an exchange account strategy or required data is missing.
 *
 * @param strategy - object with tags and on_chain_data
 */
export function getExchangeAccountInfo(strategy: {
	tags: string[];
	on_chain_data: OnChainData;
}): ExchangeAccountInfo | undefined {
	const protocol = getExchangeProtocolFromTags(strategy.tags);
	if (!protocol) return undefined;
	return buildExchangeAccountInfo(protocol, strategy.on_chain_data);
}

/**
 * Resolve exchange account info, using portfolio positions as fallback
 * when strategy tags don't include the exchange protocol.
 *
 * @param strategy - object with tags and on_chain_data
 * @param portfolio - portfolio with position data
 */
export function getExchangeAccountInfoFromPortfolio(
	strategy: { tags: string[]; on_chain_data: OnChainData },
	portfolio: Portfolio
): ExchangeAccountInfo | undefined {
	const protocol = getExchangeProtocolFromTags(strategy.tags) ?? getExchangeProtocolFromPortfolio(portfolio);
	if (!protocol) return undefined;
	return buildExchangeAccountInfo(protocol, strategy.on_chain_data);
}
