/**
 * This schema represents Terms of Service contract configuration.
 *
 * Each chain with strategies deployed should have singleton ToS contract. The configuration
 * details include a version number and corresponding file name and acceptance message.
 *
 * The acceptance message is needed to generate a hash and signature; we currently don't
 * have a way to retrieve this directly from the blockchain, so it is made available via
 * the configuration entries.
 */
import { z } from 'zod';
import { hexString } from 'trade-executor/schemas/utility-types';

export const tosContractInfoSchema = z.object({
	address: hexString.nullish(),
	version: z.number().nonnegative(),
	fileName: z.string(),
	acceptanceMessage: z.string()
});
export type TosContractInfo = z.infer<typeof tosContractInfoSchema>;

export const tosContractConfigSchema = z.record(tosContractInfoSchema);
export type TosContractConfig = z.infer<typeof tosContractConfigSchema>;
