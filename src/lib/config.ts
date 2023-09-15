/**
 * Loads TS_PUBLIC environment variables and sets global config values.
 *
 * Default values should be configured in .env, and can be overridden using
 * shell environment variables.
 *
 * This file can be imported and used directly into client-side code, but not
 * in all contexts. It works fine in component initialization or in a the load
 * function, but may generate build errors when imported by a js/ts lib file
 * or in the component module context. Test with `npm run build`.
 */
import { env } from '$env/dynamic/public';

const prefix = 'TS_PUBLIC_';

/**
 * config utility function - expects a configurator function
 * and list of environment variable keys (without prefix).
 */
function config(fn: Function, ...keys: string[]) {
	return fn(...keys.map((key) => env[`${prefix}${key}`]));
}

/**
 * Load site mode and fail loudly if not a valid value
 * - some site features depend on whether we run prod, staging or local dev
 * - defaults to "local"
 */
export const siteMode = config((mode = 'local') => {
	if (!['production', 'staging', 'local'].includes(mode)) {
		throw new Error(`Bad site mode ${mode}`);
	}
	return mode;
}, 'SITE_MODE');

/**
 * Load version tag
 */
export const version = config((version: string) => version, 'FRONTEND_VERSION_TAG');

/**
 * Load backend URL and fail loudly if not set
 */
export const backendUrl = config((url: string) => {
	if (!url) {
		throw new Error(`${prefix}BACKEND_URL missing`);
	} else if (url.endsWith('/')) {
		throw new Error(`Backend URL cannot end with slash: ${url}`);
	}
	return url;
}, 'BACKEND_URL');

/**
 * Load optional backend internal URL - see hooks/index.ts
 */
export const backendInternalUrl = config((url: string) => {
	if (url?.endsWith('/')) {
		throw new Error(`Backend URL cannot end with slash: ${url}`);
	}
	return url;
}, 'BACKEND_INTERNAL_URL');

/**
 * Load Ghost API credentials and warn if not available.
 */
export const ghostConfig = config(
	(contentApiKey: string, apiUrl: string) => {
		if (!contentApiKey || !apiUrl) {
			console.warn('You need configure Ghost API keys to render the blog');
		}
		return { contentApiKey, apiUrl };
	},
	'GHOST_CONTENT_API_KEY',
	'GHOST_API_URL'
);

/**
 * Load Typesense search API credentials and warn if not available.
 */
export const typesenseConfig = config(
	(apiKey: string, apiUrl: string) => {
		if (!apiKey || !apiUrl) {
			console.warn('You need to configure Typesense options to enable search');
		}
		return { apiKey, apiUrl };
	},
	'TYPESENSE_API_KEY',
	'TYPESENSE_API_URL'
);

/**
 * Load configured strategies.
 *
 * Strategies are configured at runtime via the TS_PUBLIC_STRATEGIES environment variable.
 *
 * The environment variable contains JSON configuration of strategies, as per configuration.ts.
 */
export const strategyConfig = config((jsonStr: string) => {
	try {
		return JSON.parse(jsonStr);
	} catch (e) {
		console.warn(`Could not parse TS_PUBLIC_STRATEGIES env JSON; content is ${jsonStr}`);
		return {};
	}
}, 'STRATEGIES');

/**
 * Load WalletConnect projectId and warn if not available.
 */
export const walletConnectConfig = config((projectId: string) => {
	if (!projectId) {
		console.warn('You need configure WalletConnect projectId to enable WalletConnect');
	}
	return { projectId };
}, 'WALLET_CONNECT_PROJECT_ID');

/**
 * Specify blockchain RPC URLs by chain ID, e.g.:
 * TS_PUBLIC_RPC_URLS='{"1":"https://eth-mainnet.url/xyz123","137":"https://polygon-mainnet.url/xyz123"}'
 */
export const rpcUrls = config((jsonStr: string) => {
	try {
		return JSON.parse(jsonStr || '{}');
	} catch (e) {
		console.warn(`${prefix}RPC_URLS is not valid JSON`, jsonStr);
		return {};
	}
}, 'RPC_URLS');

/**
 * Load chart wick threshold
 *
 * Specified as % above/below the candle body that the wick may extend when calculating
 * the yAxis scale in candle charts (prevents long wick from destroying the scale).
 *
 * Defaults to 33%
 */
export const chartWickThreshold = config((threshold: string) => {
	return Number.parseFloat(threshold) || 1 / 3;
}, 'CHART_WICK_THRESHOLD');

/**
 * Specify site-wide maintenance notice. May include HTML tags.
 * TS_PUBLIC_MAINTENANCE_NOTICE='We are currently migrating Trading Strategy database…'
 */
export const maintenanceNotice = config((value: string) => {
	return value;
}, 'MAINTENANCE_NOTICE');

/**
 * Specify chains under maintence as JSON string, e.g.:
 * TS_PUBLIC_CHAINS_UNDER_MAINTENANCE='{ "binance": "BNB Chain" }'
 */
export const chainsUnderMaintenance = config((jsonStr: string) => {
	try {
		return JSON.parse(jsonStr || '{}');
	} catch (e) {
		console.warn(`${prefix}CHAINS_UNDER_MAINTENANCE is not valid JSON`, jsonStr);
		return {};
	}
}, 'CHAINS_UNDER_MAINTENANCE');
