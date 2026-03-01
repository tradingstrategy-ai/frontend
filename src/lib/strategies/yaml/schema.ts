import { z } from 'zod';

export const yamlStrategySchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	short_description: z.string(),
	long_description: z.string().optional(),
	icon_url: z.string().optional(),
	vault_address: z.string(),
	external_url: z.string().url().optional(),
	chain_id: z.coerce.number(),
	tags: z.array(z.string()).default([]),
	sort_priority: z.coerce.number().default(0),
	frontpage: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).default(false)
});

export type YamlStrategyConfig = z.infer<typeof yamlStrategySchema>;
