import { loadEnv } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function webServerConfig(mode: string) {
	return {
		command: `pnpm run preview --mode=${mode} --host=127.0.0.1 --port=4173`,
		port: 4173,
		env: {
			...process.env,
			...loadModeEnv(mode)
		},
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
