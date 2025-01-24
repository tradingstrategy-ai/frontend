import { z } from 'zod';
import { hexString } from './core';

export const currencyBalanceSchema = z.object({
	decimals: z.number(),
	symbol: z.string(),
	value: z.bigint()
});
export type CurrencyBalance = z.infer<typeof currencyBalanceSchema>;

const baseTokenSchema = z.object({
	address: hexString,
	decimals: z.number(),
	symbol: z.string(),
	label: z.string()
});

export const tokenBalanceSchema = baseTokenSchema.merge(currencyBalanceSchema);
export type TokenBalance = z.infer<typeof tokenBalanceSchema>;

export const tokenInfoSchema = baseTokenSchema.extend({
	name: z.string(),
	version: z.string()
});
export type TokenInfo = z.infer<typeof tokenInfoSchema>;
