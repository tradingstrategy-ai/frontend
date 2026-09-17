import { loadEnv } from 'vite';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Number of times Playwright retries a failing test, on CI only.
 *
 * The integration suite drives the whole app against a single-process `vite
 * preview` server whose APIs are served by an in-process mock middleware
 * (`vite-plugin-mock-dev-server`). The test environment pins browser and API
 * URLs to the same 127.0.0.1 origin; mixing localhost and 127.0.0.1 makes
 * authenticated browser requests cross-origin and can leave the mock pending.
 * Under parallel worker load, that shared server can still intermittently
 * mishandle a request, so retries cover remaining environmental flakiness.
 *
 * Retrying on CI lets these transient blips self-recover instead of failing the
 * whole run. Locally we keep 0 retries so genuine failures surface immediately
 * rather than being masked.
 */
export const ciRetries = process.env.CI ? 2 : 0;

export function webServerConfig(mode: string) {
	const env = loadModeEnv(mode);

	// The strategies page persists a snapshot to disk and serves it on start. Start every test
	// server from an empty test-mode cache so mocked data is what the tests see.
	if (env.TS_PRIVATE_STRATEGIES_CACHE_DIR) {
		rmSync(resolve(process.cwd(), env.TS_PRIVATE_STRATEGIES_CACHE_DIR), { recursive: true, force: true });
	}

	return {
		command: `pnpm run preview --mode=${mode} --host=127.0.0.1 --port=4173`,
		port: 4173,
		env: Object.fromEntries(
			Object.entries({ ...process.env, ...env }).filter(
				(entry): entry is [string, string] => typeof entry[1] === 'string'
			)
		),
		stdout: 'ignore' as const,
		stderr: 'ignore' as const
	};
}

function loadModeEnv(mode: string): Record<string, string | undefined> {
	return {
		...loadEnv(mode, process.cwd(), ''),
		...process.env
	};
}

function stripQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'")) ||
		(value.startsWith('`') && value.endsWith('`'))
	) {
		return value.slice(1, -1);
	}

	return value;
}

function loadLocalEnvFile(fileName = '.env.local'): Record<string, string> {
	const filePath = resolve(process.cwd(), fileName);
	if (!existsSync(filePath)) return {};

	const env: Record<string, string> = {};

	for (const line of readFileSync(filePath, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex === -1) continue;

		const key = trimmed.slice(0, separatorIndex).trim();
		const value = trimmed.slice(separatorIndex + 1).trim();
		env[key] = stripQuotes(value);
	}

	return env;
}

function loadRealPrivateR2Env(): Record<string, string> {
	const localEnv = loadLocalEnvFile();
	const processEnv = process.env as Record<string, string | undefined>;

	const keys = [
		'TS_PRIVATE_R2_ACCOUNT_ID',
		'TS_PRIVATE_R2_ACCESS_KEY_ID',
		'TS_PRIVATE_R2_SECRET_ACCESS_KEY',
		'TS_PRIVATE_R2_BUCKET_NAME',
		'TS_PRIVATE_VAULT_PRICES_PARQUET_URL'
	] as const;

	return Object.fromEntries(
		keys
			.map((key) => [key, processEnv[key] || localEnv[key]])
			.filter((entry): entry is [string, string] => Boolean(entry[1]))
	);
}

export function hasPrivateR2Secrets(mode: string, source: 'mode' | 'local' = 'mode'): boolean {
	const env = source === 'local' ? loadRealPrivateR2Env() : loadModeEnv(mode);

	return Boolean(
		env.TS_PRIVATE_R2_ACCOUNT_ID &&
		env.TS_PRIVATE_R2_ACCESS_KEY_ID &&
		env.TS_PRIVATE_R2_SECRET_ACCESS_KEY &&
		env.TS_PRIVATE_R2_BUCKET_NAME
	);
}

export function privateR2WebServerConfig(mode: string) {
	return {
		...webServerConfig(mode),
		env: {
			...loadModeEnv(mode),
			...loadRealPrivateR2Env(),
			TS_PRIVATE_R2_INTEGRATION: '1'
		}
	};
}
