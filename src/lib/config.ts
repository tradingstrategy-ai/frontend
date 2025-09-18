/**
 * Loads TS_PUBLIC environment variables and sets global config values.
 *
 * Default values should be configured in .env, and can be overridden using
 * shell environment variables.
 *
 * This file can be imported and used directly into client-side code, but not
 * in all contexts. It works fine in component initialization or in a the load
 * function, but may generate build errors when imported by a js/ts lib file
 * or in the component module context. Test with `pnpm run build`.
 */
import { env } from '$env/dynamic/public';
import { type GeoBlock, geoBlockSchema } from './helpers/geo';
import { type Announcement, announcementSchema } from './schemas/announcement';
import { type TosContractConfig, tosContractConfigSchema } from 'trade-executor/schemas/tos-contract-info';

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
 * Load optional backend internal URL - see src/hooks.server.ts
 */
export const backendInternalUrl = config((url: string) => {
	if (url?.endsWith('/')) {
		throw new Error(`Backend URL cannot end with slash: ${url}`);
	}
	return url;
}, 'BACKEND_INTERNAL_URL');

/**
 * Load Sentry DSN - see hooks (both client and server)
 */
export const sentryDsn = config((dsn: string) => dsn, 'SENTRY_DSN');

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
 * Load Discord invite URL and warn if not available.
 */
export const discordUrl = config((url: string) => {
	if (!url) {
		console.warn('Discord invite URL not configured');
	}
	return url;
}, 'DISCORD_URL');

/**
 * Load Turnstile Site Key (Cloudflare CAPTCHA) and warn if not available
 */
export const turnstileSiteKey = config((key: string) => {
	if (!key) {
		console.warn('Turnstile Site Key not configured');
	}
	return key;
}, 'TURNSTILE_SITE_KEY');

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
		return [];
	}
}, 'STRATEGIES');

/**
 * If a configured strategy includes a truthy `microsite` value, set strategyMicrosite
 * to the strategy's ID (otherwise undefined)
 */
export const strategyMicrosite = ((strategies: any[]) => {
	return strategies.find((s) => s.microsite)?.id;
})(strategyConfig) as string | undefined;

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
 * Terms of Service contract configuration.
 * See: trade-executor/schemas/tos-contract-info.ts
 */
export const tosContracts = config((jsonStr: string = '{}') => {
	try {
		return tosContractConfigSchema.parse(JSON.parse(jsonStr));
	} catch (e) {
		console.warn(`${prefix}TOS_CONTRACTS is not valid ToS contract JSON`, jsonStr);
		return {};
	}
}, 'TOS_CONTRACTS') as TosContractConfig;

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

/**
 * Specify geographic blocklist as JSON record, mapping features to blocked countries, e.g.:
 * TS_PUBLIC_GEO_BLOCK='{ "strategies:view": ["CU", "IR", "KP", "RU", "SY"], … }'
 *
 * See lib/helpers/geo.ts
 */
export const geoBlock = config((jsonStr: string) => {
	try {
		return geoBlockSchema.parse(JSON.parse(jsonStr || '{}'));
	} catch (e) {
		console.warn(`${prefix}GEO_BLOCK is not valid GeoBlock JSON`, jsonStr);
		return {};
	}
}, 'GEO_BLOCK') as GeoBlock;

export const announcement = config((jsonStr: string = '') => {
	if (jsonStr.trim().length === 0) return;
	try {
		return announcementSchema.parse(JSON.parse(jsonStr || '{}'));
	} catch (e) {
		console.warn(`${prefix}ANNOUNCEMENT is not valid announcement JSON`, jsonStr);
		return undefined;
	}
}, 'ANNOUNCEMENT') as Announcement | undefined;
