import { z } from 'zod';

/**
 * Zod schema for YAML-configured strategies that live outside the trade-executor backend.
 *
 * Each strategy is defined as a YAML file in `/strategies/` (e.g. `ichi-hyperliquid.yaml`).
 * The loader (`./loader.ts`) eagerly imports all YAML files at build time via Vite glob,
 * parses them with js-yaml, and validates against this schema.
 *
 * The validated config is then adapted into a `ConnectedStrategyInfo` shape by `./adapter.ts`
 * so it can be rendered by the same listing components as backend-connected strategies.
 *
 * @see {@link file://strategies/ichi-hyperliquid.yaml} for an example with field-level comments
 */
export const yamlStrategySchema = z.object({
	// Internal id
	id: z.string(),
	// Strategy page slug
	slug: z.string(),
	// Strategy page title
	name: z.string(),
	// One paragraph description of the strategy
	short_description: z.string(),
	// Markdown description of the strategy
	long_description: z.string().optional(),
	// Optional icon URL; falls back to /avatars/{slug}.webp.
	// Image requirements: WebP format, 512x512 px, rendered as a circular avatar.
	icon_url: z.string().optional(),
	// Primary key to match it to Hyperliquid vault;
	// make sure it is string-escaped not to be hexadecimal number in JavaScript.
	vault_address: z.string(),
	// Link to the deposit page
	external_url: z.string().url().optional(),
	// 9999 is our internal synthetic chain ID for Hypercore, since it doesn't have a real chain ID
	chain_id: z.coerce.number(),
	// See https://github.com/tradingstrategy-ai/trade-executor/blob/c27b0895eabf9b9cd190afec21c5f53f626a1a3c/tradeexecutor/strategy/tag.py#L6
	tags: z.array(z.string()).default([]),
	// How far up in the listing page we display this
	sort_priority: z.coerce.number().default(0),
	// Show on front page
	frontpage: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).default(false),
	// When true, the backtest report endpoint injects a postMessage height script and CSS reset
	// into the served HTML so the iframe auto-resizes. Set to false for HTML files that already
	// include their own height-reporting snippet.
	inject_backtest_iframe_resizer: z.boolean().default(true),
	// How the front-page tile chart picks its colour (green/red):
	// - "absolute" (default): based on final value of the 90-day return series
	// - "relative": based on the change from first to last value, matching the vault detail page chart
	tile_chart_direction: z.enum(['absolute', 'relative']).default('absolute')
});

export type YamlStrategyConfig = z.infer<typeof yamlStrategySchema>;
