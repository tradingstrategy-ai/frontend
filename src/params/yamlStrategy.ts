import { yamlStrategies } from '$lib/strategies/yaml/loader';

export function match(param: string) {
	return yamlStrategies.has(param);
}
