import { z } from 'zod';

export const blockNumber = z.number().int().nonnegative();
export type BlockNumber = z.infer<typeof blockNumber>;

export const chainId = z.number().int().positive();
export type ChainId = z.infer<typeof chainId>;

export const hexEncodedData = z.string().regex(/^[0-9a-fA-F]+$/);
export type HexEncodedData = z.infer<typeof hexEncodedData>;

export const hexString = z.string().refine((arg): arg is Address => {
	return /^0x[0-9a-fA-F]+$/.test(arg);
});
export type HexString = z.infer<typeof hexString>;
