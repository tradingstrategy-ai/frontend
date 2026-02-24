/**
 * Factory to create a wrapped/enriched TradingPairInfo object
 *
 * Based on Python class found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/identifier.py
 *
 */
import type { TradingPairIdentifier } from '../schemas/identifier';

const kindShortLabels = {
	spot_market_hold: 'spot',
	spot_market_hold_rebalancing_token: 'rebalance',
	credit_supply: 'credit',
	lending_protocol_short: 'short',
	lending_protocol_long: 'long',
	vault: 'vault',
	cash: 'cash',
	exchange_account: 'exchange'
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

	get isVault() {
		return this.kind === 'vault';
	},

	get symbol(): string {
		const { base, quote } = this.pricingPair;

		switch (this.kind) {
			case 'credit_supply':
				return quote.token_symbol;
			case 'vault':
				return this.other_data?.vault_name ?? base.token_symbol;
			case 'exchange_account': {
				const name = this.exchange_name ?? this.other_data?.exchange_protocol;
				return name ? name.charAt(0).toUpperCase() + name.slice(1) : '<Unknown exchange>';
			}
			default:
				return `${base.token_symbol}-${quote.token_symbol}`;
		}
	},

	get actionSymbol() {
		if (this.isCreditSupply) {
			return this.pricingPair.quote.token_symbol;
		}
		if (this.kind === 'exchange_account') {
			return 'USD';
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
