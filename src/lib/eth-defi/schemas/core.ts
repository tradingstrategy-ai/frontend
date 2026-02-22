import { z } from 'zod';

export const blockNumber = z.int().nonnegative();
export type BlockNumber = z.infer<typeof blockNumber>;

export const chainId = z.int().positive();
export type ChainId = z.infer<typeof chainId>;

export const hexEncodedData = z.string().regex(/^[0-9a-fA-F]+$/);
export type HexEncodedData = z.infer<typeof hexEncodedData>;

export const hexString = z.custom<`0x${string}`>((arg) => {
	return typeof arg === 'string' && /^0x[0-9a-fA-F]+$/.test(arg);
});
export type HexString = z.infer<typeof hexString>;

/**
 * Vault address schema supporting multiple address formats:
 * - EVM hex addresses: 0x-prefixed hex strings (e.g., 0x1234...abcd)
 * - GRVT vault identifiers: vlt:-prefixed strings (e.g., vlt:2zqosukicgltfcjdet4kpmecvfg)
 */
export const vaultAddress = z.string().min(1);
export type VaultAddress = z.infer<typeof vaultAddress>;
