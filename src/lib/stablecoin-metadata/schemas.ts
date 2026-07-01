// Schema definitions for stablecoin metadata fetched from external API
import { z } from 'zod';
import { isoDateTime } from '$lib/schemas/utility';

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
	short_description: z.string(),
	long_description: z.string().optional(),
	description: z.string(),
	category: z.string(),
	links: stablecoinLinksSchema,
	logos: stablecoinLogosSchema,
	coingecko_id: z.string().nullable().optional(),
	coingecko_link: z.url().nullable().optional(),
	coingecko_id_source: z.string().nullable().optional(),
	coingecko_id_verified_at: isoDateTime.nullable().optional(),
	usd_rate: z.number().nullable().optional(),
	usd_rate_fetched_at: isoDateTime.nullable().optional(),
	usd_rate_updated_at: isoDateTime.nullable().optional(),
	peg_rate: z.number().nullable().optional(),
	peg_rate_currency: z.string().nullable().optional(),
	rate_fetch_failed_at: isoDateTime.nullable().optional(),
	rate_fetch_failed_reason: z.string().nullable().optional(),
	depegged_at: isoDateTime.nullable().optional()
});

export type StablecoinMetadata = z.infer<typeof stablecoinMetadataSchema>;
