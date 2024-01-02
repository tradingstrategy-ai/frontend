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

// zod schemas can't reference themselves, so in order for `underlying` to
// reference another assetIdentifier, we define a base schema and extend it
const assetIdentifierBase = z.object({
	chain_id: chainId,
	address: hexString,
	token_symbol: z.string(),
	decimals: z.number(),
	internal_id: primaryKey.nullish(),
	info_url: z.string().url().nullish(),
	type: assetType.nullish(),
	underlying: z.null().optional(),
	liquidation_threshold: z.number().nullish()
});

export const assetIdentifierSchema = assetIdentifierBase.extend({
	underlying: assetIdentifierBase.nullish()
});
export type AssetIdentifier = z.infer<typeof assetIdentifierSchema>;

export const tradingPairKind = z.enum([
	'spot_market_hold',
	'spot_market_hold_rebalancing_token',
	'credit_supply',
	'lending_protocol_long',
	'lending_protocol_short'
]);

// zod schemas can't reference themselves, so in order for `underlying_spot_pair`
// to reference another tradingPairIdentifier, we define a base schema and extend it
const tradingPairIdentifierBase = z.object({
	base: assetIdentifierSchema,
	quote: assetIdentifierSchema,
	pool_address: hexString,
	exchange_address: hexString,
	internal_id: primaryKey.nullish(),
	internal_exchange_id: primaryKey.nullish(),
	info_url: z.string().url().nullish(),
	fee: percent.nullish(),
	reverse_token_order: z.boolean().nullish(),
	kind: tradingPairKind,
	underlying_spot_pair: z.null().optional()
});

export const tradingPairIdentifierSchema = tradingPairIdentifierBase.extend({
	underlying_spot_pair: tradingPairIdentifierBase.nullish()
});
export type TradingPairIdentifier = z.infer<typeof tradingPairIdentifierSchema>;

export const assetWithTrackedValueSchema = z.object({
	asset: assetIdentifierSchema,
	quantity: decimal,
	last_usd_price: usDollarPrice,
	last_pricing_at: unixTimestamp,
	created_at: unixTimestamp,
	created_strategy_cycle_at: unixTimestamp.nullish()
});
export type AssetWithTrackedValue = z.infer<typeof assetWithTrackedValueSchema>;
