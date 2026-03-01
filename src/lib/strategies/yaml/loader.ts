/**
 * Load YAML strategy config files using js-yaml FAILSAFE_SCHEMA + Zod validation.
 *
 * FAILSAFE_SCHEMA treats all values as strings (no implicit type coercion —
 * avoids the "Norway problem"). Zod's `z.coerce` handles type conversion.
 */
import jsYaml from 'js-yaml';
import { yamlStrategySchema, type YamlStrategyConfig } from './schema';

function parseYaml(raw: string): YamlStrategyConfig {
	const parsed = jsYaml.load(raw, { schema: jsYaml.FAILSAFE_SCHEMA });
	return yamlStrategySchema.parse(parsed);
}

const yamlFiles = import.meta.glob('./configs/*.yaml', { eager: true, query: '?raw', import: 'default' });

export const yamlStrategies: Map<string, YamlStrategyConfig> = new Map();

for (const [path, raw] of Object.entries(yamlFiles)) {
	try {
		const config = parseYaml(raw as string);
		yamlStrategies.set(config.id, config);
	} catch (e) {
		console.warn(`Failed to parse YAML strategy config: ${path}`, e);
	}
}
