/**
 * Utility zod schemas/types used in other state schemas
 *
 * Based on Python types found in:
 * - https://github.com/tradingstrategy-ai/trading-strategy/blob/master/tradingstrategy/
 * - https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/types.py
 *
 */
import { z } from 'zod';
export type { BlockNumber, ChainId, HexEncodedData, HexString } from '$lib/eth-defi/schemas/core';
export { blockNumber, chainId, hexEncodedData, hexString } from '$lib/eth-defi/schemas/core';

export const count = z.number().int().nonnegative();
export type Count = z.infer<typeof count>;

// decimal values _should_ always be serialized as strings to preserve precision;
// coercing to strings to prevent errors in cases where they are serialized as numbers
// (e.g., `"executed_collateral_allocation": 0` for open short sell trades)
export const decimal = z.coerce.string().regex(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/);
export type Decimal = z.infer<typeof decimal>;

// use `instead of `decimal` when you want the value coerced to a number
// no type export needed since it's just `number`
export const decimalToNumber = z.coerce.number();

export const duration = z.coerce.number().nonnegative();
export type Duration = z.infer<typeof duration>;

export const percent = z.coerce.number();
export type Percent = z.infer<typeof percent>;

export const primaryKey = z.number().int().positive();
export type PrimaryKey = z.infer<typeof primaryKey>;

// This is needed when primary key is used as record key
export const primaryKeyString = z.string().regex(/^\d+$/);
export type PrimaryKeyString = z.infer<typeof primaryKeyString>;

export const unixTimestamp = z.number().nonnegative();
export type UnixTimestamp = z.infer<typeof unixTimestamp>;

// use instead of unixTimestamp when you want the value coerced to a Date
// no type export needed since it's just `Date`
export const unixTimestampToDate = unixTimestamp.transform((ts) => new Date(ts * 1000));

export const usDollarAmount = z.coerce.number();
export type USDollarAmount = z.infer<typeof usDollarAmount>;

export const usDollarPrice = z.coerce.number();
export type USDollarPrice = z.infer<typeof usDollarPrice>;

export const performanceTuple = z.tuple([unixTimestamp, decimalToNumber]);
export type PerformanceTuple = z.infer<typeof performanceTuple>;

export const performanceData = performanceTuple.array();
export type PerformanceData = z.infer<typeof performanceData>;
