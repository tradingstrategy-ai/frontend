// Schema definitions for stablecoin metadata fetched from external API
import { z } from 'zod';

const stablecoinLinksSchema = z.object({
	homepage: z.url().nullable(),
	coingecko: z.url().nullable(),
	defillama: z.url().nullable(),
	twitter: z.url().nullable()
});

const stablecoinLogosSchema = z.object({
	light: z.url().nullable()
});

export const stablecoinMetadataSchema = z.object({
	symbol: z.string(),
	slug: z.string(),
	name: z.string(),
	description: z.string(),
	category: z.string(),
	links: stablecoinLinksSchema,
	logos: stablecoinLogosSchema
});

export type StablecoinMetadata = z.infer<typeof stablecoinMetadataSchema>;
