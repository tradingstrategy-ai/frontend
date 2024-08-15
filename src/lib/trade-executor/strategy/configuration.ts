import { strategyConfig } from '$lib/config';
import { z } from 'zod';
import { percent } from '../state/utility-types';

export const strategyFeesSchema = z.object({
	management_fee: percent.default(0),
	trading_strategy_protocol_fee: percent.default(0),
	strategy_developer_fee: percent.default(0),
	enzyme_protocol_fee: percent.default(0.0025)
});
export type StrategyFees = z.infer<typeof strategyFeesSchema>;

export const strategyConfigurationSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.string().url(),
	fees: strategyFeesSchema.default({}),
	new_version_id: z.string().nullish(),
	frontpage: z.boolean().nullish()
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
