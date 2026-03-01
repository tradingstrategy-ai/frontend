/**
 * Load YAML strategy config files using js-yaml JSON_SCHEMA + Zod validation.
 *
 * JSON_SCHEMA resolves booleans, numbers, and null natively without the
 * dangerous implicit coercions of DEFAULT_SCHEMA (e.g., `NO` → `false`).
 * This allows YAML files to use native types: `chain_id: 9999` instead
 * of `chain_id: '9999'`.
 */
import jsYaml from 'js-yaml';
import { yamlStrategySchema, type YamlStrategyConfig } from './schema';

function parseYaml(raw: string): YamlStrategyConfig {
	const parsed = jsYaml.load(raw, { schema: jsYaml.JSON_SCHEMA });
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
		yamlStrategies.set(config.slug, config);
	} catch (e) {
		console.warn(`Failed to parse YAML strategy config: ${path}`, e);
	}
}
