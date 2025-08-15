/**
 * zod schemas for assets (tokens) and trading pairs
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/identifier.py
 *
 */
import { z } from 'zod';
import { chainId, decimal, hexString, percent, primaryKey, unixTimestamp, usDollarPrice } from './utility-types';

export const assetType = z.enum(['token', 'collateral', 'borrowed']);

// Using Zod 4's recursive types with getter syntax
export const assetIdentifierSchema = z.object({
	chain_id: chainId,
	address: hexString,
	token_symbol: z.string(),
	decimals: z.int().nonnegative(),
	internal_id: primaryKey.nullish(),
	info_url: z.url().nullish(),
	get underlying() {
		return assetIdentifierSchema.nullish();
	},
	type: assetType.nullish(),
	liquidation_threshold: z.number().nullish()
});
export type AssetIdentifier = z.infer<typeof assetIdentifierSchema>;

export const tradingPairKind = z.enum([
	'spot_market_hold',
	'spot_market_hold_rebalancing_token',
	'credit_supply',
	'lending_protocol_long',
	'lending_protocol_short',
	'vault',
	'cash'
]);

// Using Zod 4's recursive types with getter syntax
export const tradingPairIdentifierSchema = z.object({
	base: assetIdentifierSchema,
	quote: assetIdentifierSchema,
	pool_address: hexString,
	exchange_address: hexString.nullish(),
	internal_id: primaryKey.nullish(),
	internal_exchange_id: primaryKey.nullish(),
	info_url: z.url().nullish(),
	fee: percent.nullish(),
	reverse_token_order: z.boolean().nullish(),
	kind: tradingPairKind,
	get underlying_spot_pair() {
		return tradingPairIdentifierSchema.nullish();
	},
	exchange_name: z.string().nullish(),
	other_data: z.record(z.string(), z.any()).nullish()
});
export type TradingPairIdentifier = z.infer<typeof tradingPairIdentifierSchema>;

export const assetWithTrackedValueSchema = z.object({
	asset: assetIdentifierSchema,
	quantity: decimal,
	last_usd_price: usDollarPrice,
	last_pricing_at: unixTimestamp,
	created_at: unixTimestamp,
	created_strategy_cycle_at: unixTimestamp.nullish(),
	interest_rate_at_open: percent.nullish(),
	last_interest_rate: percent.nullish()
});
export type AssetWithTrackedValue = z.infer<typeof assetWithTrackedValueSchema>;
