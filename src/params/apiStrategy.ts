import { configuredStrategies } from 'trade-executor/schemas/configuration';

export function match(param: string) {
	return configuredStrategies.has(param);
}
