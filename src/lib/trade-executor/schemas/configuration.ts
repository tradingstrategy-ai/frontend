import { strategyConfig } from '$lib/config';
import { z } from 'zod';
import { primaryKey } from './utility-types';

export const strategyConfigurationSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.url(),
	newVersionId: z.string().optional(),
	hiddenPositions: primaryKey.array().default([]),
	frontpage: z.boolean().default(false),
	microsite: z.boolean().default(false),
	depositExternal: z.boolean().default(false),
	useSharePrice: z.boolean().default(false),
	// How the tile chart determines green/red colour:
	// - "absolute": direction from the last data point's value (positive = green, negative = red)
	// - "relative": direction from the change across the series — (last - first) / (1 + first) —
	//   so a chart that dips then recovers shows green even if the final value is still negative
	tileChartDirection: z.enum(['absolute', 'relative']).default('absolute')
});
export type StrategyConfiguration = z.infer<typeof strategyConfigurationSchema>;

/**
 * export all configured strategies as a Map for easy iteration and lookup
 */
export const configuredStrategies = ((strategies) => {
	for (const config of strategyConfig) {
		try {
			strategies.set(config.id, strategyConfigurationSchema.parse(config));
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			console.warn('Failed to parse strategy config', config, message);
		}
	}
	return strategies;
})(new Map() as Map<string, StrategyConfiguration>);
