/**
 * Loads environment variables and sets global config values.
 *
 * Default values should be configured in .env, and can be overridden using
 * shell environment variables.
 *
 * Values that can be exposed client-side without security concerns should be
 * prefixed `TS_PUBLIC_`. Values that should only be available server-side
 * should be prefixed `TS_PRIVATE_`, and should not be included in .env (since
 * it is checked into version control).
 *
 * This file cannot be imported directly into client-side code! It is imported
 * by `hooks/index.ts` and public-facing config values are exposed client-side
 * via `getSession`. Session data can be accessed from the `load` function or
 * `$session` store.
 */
import 'dotenv/config';

const publicPrefix = 'TS_PUBLIC_';

const publicEnvKeys = Object.keys(process.env)
	.filter((key) => key.startsWith(publicPrefix))
	.map((key) => key.replace(publicPrefix, ''));

const publicConfig = {};

function configurePublicVar(configKey: string, pattern: string, setFn: Function) {
	const envData = {};
	for (const key of publicEnvKeys) {
		if (key.startsWith(pattern)) {
			envData[key] = process.env[`${publicPrefix}${key}`];
		}
	}
	publicConfig[configKey] = setFn(envData);
}

/**
 * Load Site Mode and fail loudly if not a valid value
 * - some site features depend on whether we run prod, staging or local dev
 * - defaults to "local"
 */
configurePublicVar('siteMode', 'SITE_MODE', ({ SITE_MODE = 'local' }) => {
	if (!['production', 'staging', 'local'].includes(SITE_MODE)) {
		throw new Error(`Bad site mode ${SITE_MODE}`);
	}
	return SITE_MODE;
});

/**
 * Load Ghost API credentials and warn if not available.
 */
configurePublicVar('ghost', 'GHOST_', (env) => {
	const contentApiKey = env.GHOST_CONTENT_API_KEY;
	const apiUrl = env.GHOST_API_URL;
	if (!contentApiKey || !apiUrl) {
		console.warn('You need configure Ghost API keys to render the blog');
	}
	return { contentApiKey, apiUrl };
});

/**
 * Load Typesense config options and warn if not available.
 */
configurePublicVar('typesense', 'TYPESENSE_API_', (env) => {
	const apiKey = env.TYPESENSE_API_KEY;
	const apiUrl = env.TYPESENSE_API_URL;
	if (!apiKey || !apiUrl) {
		console.warn('You need to configure Typesense options to enable search');
	}
	return { apiKey, apiUrl };
});

/**
 * Specify chains under maintence as JSON string, e.g.:
 * TS_PUBLIC_CHAINS_UNDER_MAINTENANCE='{ "binance": "BNB Chain" }'
 *
 * See: checkChainMaintenance
 */
configurePublicVar('chainsUnderMaintenance', 'CHAINS_UNDER_MAINTENANCE', (env) => {
	const jsonStr = env.CHAINS_UNDER_MAINTENANCE || '{}';
	try {
		return JSON.parse(jsonStr);
	} catch (e) {
		console.warn('TS_PUBLIC_CHAINS_UNDER_MAINTENANCE is not valid JSON', jsonStr);
		return {};
	}
});

export default publicConfig;
