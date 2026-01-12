// Schema definitions for vault protocol metadata fetched from external API
import { z } from 'zod';

const logosSchema = z.object({
	light: z.url().nullable(),
	dark: z.url().nullable()
});

const linksSchema = z.object({
	homepage: z.url().nullable(),
	twitter: z.url().nullable(),
	documentation: z.url().nullable(),
	github: z.url().nullable(),
	defillama: z.url().nullable(),
	audits: z.url().nullable()
});

export const vaultProtocolMetadataSchema = z.object({
	name: z.string(),
	slug: z.string(),
	short_description: z.string(),
	long_description: z.string(),
	links: linksSchema,
	logos: logosSchema
});

export type VaultProtocolMetadata = z.infer<typeof vaultProtocolMetadataSchema>;
