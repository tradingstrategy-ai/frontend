/**
 * Helpers for exchange account strategies (e.g., GMX, Derive, Hyperliquid, Lighter).
 *
 * Provides URL builders and display names for linking to external exchange
 * account views from strategy and position pages.
 */
import type { Portfolio } from '../schemas/portfolio';
import type { OnChainData } from '../schemas/summary';
import type { TradingPairIdentifier } from '../schemas/identifier';

/**
 * Identifiers an exchange may need to build its public account page URL.
 *
 * - `address`: the on-chain address (the Lagoon Safe) – used by EVM exchanges such as GMX and Derive
 * - `accountId`: the exchange-native account identifier – used by Lighter, whose explorer is keyed
 *   by account index rather than address
 */
export type ExchangeAccountRef = {
	address?: string;
	accountId?: string;
};

const exchangeUrls: Record<string, (ref: ExchangeAccountRef) => string | undefined> = {
	gmx: ({ address }) => address && `https://app.gmx.io/#/accounts/${address}`,
	derive: ({ address }) => address && `https://explorer.derive.xyz/address/${address}`,
	hyperliquid: ({ address }) => address && `https://app.hyperliquid.xyz/vaults/${address}`,
	lighter: ({ accountId }) => accountId && `https://app.lighter.xyz/explorer/accounts/${accountId}`
};

const exchangeNames: Record<string, string> = {
	gmx: 'GMX',
	derive: 'Derive',
	hyperliquid: 'Hyperliquid',
	lighter: 'Lighter'
};

/** Position statuses viewable on each exchange's external page. */
const exchangeVisiblePositions: Record<string, Set<string>> = {
	gmx: new Set(['open']),
	derive: new Set(['open', 'closed']),
	hyperliquid: new Set(['open', 'closed']),
	// Lighter's explorer account page lists open positions and a raw trade log, but has no closed-position view
	lighter: new Set(['open'])
};

export type ExchangeAccountInfo = { url: string; name: string; protocol: string };

/** Minimal strategy shape needed to resolve an exchange account. */
export type ExchangeStrategy = { tags: string[]; on_chain_data: OnChainData };

/** Minimal position shape needed to resolve an exchange account. */
export type ExchangePosition = { pair: Pick<TradingPairIdentifier, 'kind' | 'other_data'> };

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
 * @param protocol - exchange protocol identifier (e.g., "gmx", "derive", "lighter")
 * @param ref - address and/or exchange-native account id; which one is required depends on the exchange
 */
export function getExchangeAccountUrl(protocol: string, ref: ExchangeAccountRef): string | undefined {
	return exchangeUrls[protocol]?.(ref) || undefined;
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
 * Extract the exchange protocol from strategy tags matching `exchange_account_strategy_{protocol}`.
 *
 * Not all executors set the protocol-suffixed tag (e.g. GMX and Lighter only set the generic
 * `exchange_account_strategy`), so callers should also consult position data.
 */
function getExchangeProtocolFromTags(tags: string[]): string | undefined {
	const tag = tags.find((t) => t.startsWith(TAG_PREFIX));
	return tag?.slice(TAG_PREFIX.length);
}

/**
 * Extract the exchange protocol and exchange-native account id from the first `exchange_account`
 * position found. The trade executor stores these in the pair's `other_data` as `exchange_protocol`
 * and `exchange_subaccount_id` (the Lighter account index).
 */
function getExchangeProtocolFromPositions(positions: ExchangePosition[]) {
	for (const { pair } of positions) {
		if (pair.kind !== 'exchange_account') continue;
		const protocol = pair.other_data?.exchange_protocol as string | undefined;
		if (!protocol) continue;
		const accountId = pair.other_data?.exchange_subaccount_id;
		return { protocol, accountId: accountId == null ? undefined : String(accountId) };
	}
}

/**
 * Resolve exchange account info for a strategy.
 *
 * The protocol is taken from strategy tags, falling back to `exchange_account` position data.
 * Positions are also the only source of the exchange-native account id needed by Lighter, so
 * they are consulted even when tags name the protocol. Returns undefined if the strategy is not
 * an exchange account strategy or the data needed to build its URL is missing.
 *
 * @param strategy - object with tags and on_chain_data
 * @param positions - positions to inspect for an `exchange_account` pair (optional)
 */
export function getExchangeAccountInfo(
	strategy: ExchangeStrategy,
	positions: ExchangePosition[] = []
): ExchangeAccountInfo | undefined {
	const fromPositions = getExchangeProtocolFromPositions(positions);
	const protocol = getExchangeProtocolFromTags(strategy.tags) ?? fromPositions?.protocol;
	if (!protocol) return undefined;

	const { on_chain_data } = strategy;
	const address = on_chain_data.asset_management_mode === 'lagoon' ? on_chain_data.smart_contracts.safe : undefined;
	const url = getExchangeAccountUrl(protocol, { address, accountId: fromPositions?.accountId });
	if (!url) return undefined;

	return { url, name: getExchangeDisplayName(protocol), protocol };
}

/**
 * Resolve exchange account info using the strategy's open and closed portfolio positions.
 *
 * @param strategy - object with tags and on_chain_data
 * @param portfolio - portfolio with position data
 */
export function getExchangeAccountInfoFromPortfolio(
	strategy: ExchangeStrategy,
	portfolio: Portfolio
): ExchangeAccountInfo | undefined {
	return getExchangeAccountInfo(strategy, [
		...Object.values(portfolio.open_positions),
		...Object.values(portfolio.closed_positions)
	]);
}
