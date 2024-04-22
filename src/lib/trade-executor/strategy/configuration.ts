import { strategyConfig } from '$lib/config';
import { z } from 'zod';

export const strategyConfigurationSchema = z.object({
	 id: z.string(),
	name: z.string(),
	url: z.string().url()
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
