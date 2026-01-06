// Schema definitions for vault protocol metadata fetched from external API
import { z } from 'zod';

const logosSchema = z.object({
	light: z.string().url().nullable(),
	dark: z.string().url().nullable()
});

const linksSchema = z
	.object({
		homepage: z.string().url().nullable(),
		twitter: z.string().url().nullable(),
		documentation: z.string().url().nullable(),
		github: z.string().url().nullable()
	})
	.passthrough();

export const vaultProtocolMetadataSchema = z
	.object({
		name: z.string(),
		slug: z.string(),
		short_description: z.string(),
		long_description: z.string(),
		links: linksSchema,
		logos: logosSchema
	})
	.passthrough();

export type VaultProtocolMetadata = z.infer<typeof vaultProtocolMetadataSchema>;
