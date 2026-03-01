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

// Vite resolves both globs at build time; the mode conditional selects which to use.
// Test configs live in tests/strategies/ to avoid coupling tests to production configs.
const yamlFiles =
	import.meta.env.MODE === 'test'
		? import.meta.glob('/tests/strategies/*.yaml', { eager: true, query: '?raw', import: 'default' })
		: import.meta.glob('/strategies/*.yaml', { eager: true, query: '?raw', import: 'default' });

export const yamlStrategies: Map<string, YamlStrategyConfig> = new Map();

for (const [path, raw] of Object.entries(yamlFiles)) {
	try {
		const config = parseYaml(raw as string);
		yamlStrategies.set(config.id, config);
	} catch (e) {
		console.warn(`Failed to parse YAML strategy config: ${path}`, e);
	}
}
