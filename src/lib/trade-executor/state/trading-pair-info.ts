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

export const createTradingPairInfo = <T extends TradingPairIdentifier>(base: T) => ({
	...base,

	get underlyingSpotPair(): Maybe<TradingPairInfo> {
		return this.underlying_spot_pair && createTradingPairInfo(this.underlying_spot_pair);
	},

	get pricingPair(): TradingPairInfo {
		return this.kind.startsWith('lending_protocol_') ? this.underlyingSpotPair! : this;
	},

	get isCreditSupply() {
		return this.kind === 'credit_supply';
	},

	get isShort() {
		return this.kind === 'lending_protocol_short';
	},

	get symbol() {
		const { base, quote } = this.pricingPair;
		if (this.isCreditSupply) {
			return quote.token_symbol;
		}
		return `${base.token_symbol}-${quote.token_symbol}`;
	},

	get actionSymbol() {
		if (this.isCreditSupply) {
			return this.pricingPair.quote.token_symbol;
		}
		return this.pricingPair.base.token_symbol;
	},

	get kindShortLabel() {
		return kindShortLabels[this.kind];
	}
});

// exclude underlying_spot_pair from the type (use underlyingSpotPair getter instead)
export type TradingPairInfo = Omit<
	ReturnType<typeof createTradingPairInfo<TradingPairIdentifier>>,
	'underlying_spot_pair'
>;
