/**
 * Utility zod schemas/types used in other state schemas
 *
 * Based on Python types found in:
 * - https://github.com/tradingstrategy-ai/trading-strategy/blob/master/tradingstrategy/
 * - https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/types.py
 *
 */
import { z } from 'zod';

export const blockNumber = z.number().int().positive();

export const chainId = z.number().int().positive();

export const count = z.number().int().nonnegative();

export const decimal = z.string().regex(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/);

export const duration = z.coerce.number().nonnegative();

export const hexEncodedData = z.string().regex(/^[0-9a-fA-F]+$/);

export const hexString = z.string().regex(/^0x[0-9a-fA-F]+$/);

export const percent = z.coerce.number();

export const primaryKey = z.number().int();

// This is needed when primary key is used as record key
export const primaryKeyString = z.string().regex(/^\d+$/);

export const unixTimestamp = z.number().nonnegative();

export const usDollarAmount = z.coerce.number();

export const usDollarPrice = z.coerce.number();
