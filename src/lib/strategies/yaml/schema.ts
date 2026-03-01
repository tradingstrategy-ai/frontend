import { z } from 'zod';

export const yamlStrategySchema = z.object({
	id: z.string(),
	name: z.string(),
	short_description: z.string(),
	long_description: z.string().optional(),
	icon_url: z.string().optional(),
	vault_slug: z.string(),
	chain_id: z.coerce.number(),
	tags: z.array(z.string()).default([]),
	sort_priority: z.coerce.number().default(0),
	frontpage: z.coerce.boolean().default(false)
});

export type YamlStrategyConfig = z.infer<typeof yamlStrategySchema>;
