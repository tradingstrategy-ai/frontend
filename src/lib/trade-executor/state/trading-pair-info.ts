/**
 * Factory to create a wrapped/enriched TradingPairInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/identifier.py
 *
 */
import type { TradingPairIdentifier } from './identifier';

const kindShortLabels = {
	spot_market_hold: 'spot',
	spot_market_hold_rebalancing_token: 'rebalance',
	credit_supply: 'credit',
	lending_protocol_short: 'short',
	lending_protocol_long: 'long'
} as const;

/**
 * Prototype object that can be applied to a TradingPairIdentifier object
 * to enrich it with additional properties. Yields an object with all the
 * properties (and types) of the original plus the inherited prototype
 * properties/types (which is non-trivial with TypeScript classes)
 */
const tradingPairInfoPrototype = {
	get underlyingSpotPair(): TradingPairInfo | undefined {
		if (this.underlying_spot_pair) {
			return createTradingPairInfo(this.underlying_spot_pair);
		}
	},

	get pricingPair() {
		if (this.kind === 'lending_protocol_short' || this.kind === 'lending_protocol_long') {
			return this.underlyingSpotPair;
		}
		return this;
	},

	get symbol() {
		const { base, quote } = this.pricingPair;
		if (this.kind === 'credit_supply') {
			return quote.token_symbol;
		}
		return `${base.token_symbol}-${quote.token_symbol}`;
	},

	get kindShortLabel() {
		return kindShortLabels[this.kind];
	},

	get infoUrl() {
		return this.pricingPair.info_url;
	}
} satisfies ThisType<TradingPairIdentifier & Record<string, any>>;

// exclude underlying_spot_pair from the type (use underlyingSpotPair getter instead)
type TradingPairInfoBase = Omit<TradingPairIdentifier, 'underlying_spot_pair'>;
export type TradingPairInfo = TradingPairInfoBase & typeof tradingPairInfoPrototype;

/**
 * Factory function to create a TradingPairInfo object
 */
export function createTradingPairInfo(data: TradingPairIdentifier): TradingPairInfo {
	return Object.assign(Object.create(tradingPairInfoPrototype), data);
}
