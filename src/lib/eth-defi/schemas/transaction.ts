import { z } from 'zod';
import { hexString } from './core';

// This is needed to match viem's Transaction Log type
const topicsSchema = z.union([
	z.tuple([]), // explicitly empty array
	z.tuple([hexString]).rest(hexString) // non-empty array with at least one hexString
]);

export const transactionLog = z.object({
	address: hexString,
	blockHash: hexString,
	blockNumber: z.bigint(),
	data: hexString,
	logIndex: z.number(),
	transactionHash: hexString,
	transactionIndex: z.number(),
	removed: z.boolean(),
	topics: topicsSchema
});
export type TransactionLog = z.infer<typeof transactionLog>;
