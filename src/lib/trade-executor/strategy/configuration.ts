import { strategyConfig } from '$lib/config';
import { z } from 'zod';
import { primaryKey } from '../state/utility-types';

export const strategyConfigurationSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.string().url(),
	new_version_id: z.string().optional(),
	hiddenPositions: primaryKey.array().default([]),
	frontpage: z.boolean().default(false),
	depositOnEnzyme: z.boolean().default(false)
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
