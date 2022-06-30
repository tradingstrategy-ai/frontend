/**
 * Loads TS_PUBLIC environment variables and sets global config values.
 *
 * Default values should be configured in .env, and can be overridden using
 * shell environment variables.
 *
 * Values that can be exposed client-side without security concerns should be
 * prefixed `TS_PUBLIC_`. Values that should only be available server-side
 * should be prefixed `TS_` (no `PUBLIC_`), and should not be included in .env
 * (since it is checked into version control). Those variables don't require
 * special processing and may be accessed server-side as `process.env.TS_VAR`.
 *
 * This file cannot be imported directly into client-side code! It is imported
 * by `hooks/index.ts` and public-facing config values are exposed client-side
 * via `getSession`. Session data can be accessed from the `load` function or
 * `$session` store.
 */
import 'dotenv/config';

const prefix = 'TS_PUBLIC_';

// get list of environment keys beginning with TS_PUBLIC_
const envKeys = Object.keys(process.env)
	.filter((key) => key.startsWith(prefix))
	.map((key) => key.replace(prefix, ''));

const config = {};

interface Env {
	[key: string]: string;
}

/**
 * Utility function for safely adding TS_PUBLIC_ environment variables to config
 */
function configureEnvVar(configKey: string, pattern: string, setFn: Function) {
	const env: Env = {};
	for (const key of envKeys) {
		if (key.startsWith(pattern)) {
			env[key] = process.env[`${prefix}${key}`];
		}
	}
	config[configKey] = setFn(env);
}

/**
 * Load Site Mode and fail loudly if not a valid value
 * - some site features depend on whether we run prod, staging or local dev
 * - defaults to "local"
 */
type SiteMode = 'production' | 'staging' | 'local';

configureEnvVar('siteMode', 'SITE_MODE', ({ SITE_MODE = 'local' }) => {
	if (!['production', 'staging', 'local'].includes(SITE_MODE)) {
		throw new Error(`Bad site mode ${SITE_MODE}`);
	}
	return SITE_MODE as SiteMode;
});

/**
 * Load Backend URL and fail loudly if not set
 */
configureEnvVar('backendUrl', 'BACKEND_URL', ({ BACKEND_URL }) => {
	if (!BACKEND_URL) {
		throw new Error('TS_PUBLIC_BACKEND_URL missing');
	} else if (BACKEND_URL.endsWith('/')) {
		throw new Error(`Backend URL cannot end with slash: ${BACKEND_URL}`);
	}
	return BACKEND_URL;
});

/**
 * Backend internal URL (optional); set this when running frontend and backend on the
 * same host or same local network (e.g., production). See: hooks/index.ts:externalFetch
 */
configureEnvVar('backendInternalUrl', 'BACKEND_INTERNAL_URL', ({ BACKEND_INTERNAL_URL }) => {
	if (BACKEND_INTERNAL_URL?.endsWith('/')) {
		throw new Error(`Backend internal URL cannot end with slash: ${BACKEND_INTERNAL_URL}`);
	}
	return BACKEND_INTERNAL_URL;
});

/**
 * Load Ghost API credentials and warn if not available.
 */
interface GhostConfig {
	contentApiKey: string;
	apiUrl: string;
}

configureEnvVar('ghost', 'GHOST_', (env: Env) => {
	const contentApiKey = env.GHOST_CONTENT_API_KEY;
	const apiUrl = env.GHOST_API_URL;
	if (!contentApiKey || !apiUrl) {
		console.warn('You need configure Ghost API keys to render the blog');
	}
	return { contentApiKey, apiUrl } as GhostConfig;
});

/**
 * Load Typesense config options and warn if not available.
 */
interface TypesenseConfig {
	apiKey: string;
	apiUrl: string;
}

configureEnvVar('typesense', 'TYPESENSE_API_', (env: Env) => {
	const apiKey = env.TYPESENSE_API_KEY;
	const apiUrl = env.TYPESENSE_API_URL;
	if (!apiKey || !apiUrl) {
		console.warn('You need to configure Typesense options to enable search');
	}
	return { apiKey, apiUrl } as TypesenseConfig;
});

/**
 * Specify chains under maintence as JSON string, e.g.:
 * TS_PUBLIC_CHAINS_UNDER_MAINTENANCE='{ "binance": "BNB Chain" }'
 *
 * See: checkChainMaintenance
 */
interface ChainsUnderMaintenance {
	[key: string]: string;
}

configureEnvVar('chainsUnderMaintenance', 'CHAINS_UNDER_MAINTENANCE', (env: Env) => {
	const jsonStr = env.CHAINS_UNDER_MAINTENANCE || '{}';
	try {
		return JSON.parse(jsonStr) as ChainsUnderMaintenance;
	} catch (e) {
		console.warn('TS_PUBLIC_CHAINS_UNDER_MAINTENANCE is not valid JSON', jsonStr);
		return {} as ChainsUnderMaintenance;
	}
});

export interface Config {
	siteMode: SiteMode;
	backendUrl: string;
	backendInternalUrl: string;
	ghost: GhostConfig;
	typesense: TypesenseConfig;
	chainsUnderMaintenance: ChainsUnderMaintenance;
}

export default config as Config;
