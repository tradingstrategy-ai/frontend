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
import { env as publicEnv } from '$env/dynamic/public';

const prefix = 'TS_PUBLIC_';

function getEnv(key: string) {
	return publicEnv[`${prefix}${key}`];
}

type SiteMode = 'production' | 'staging' | 'local';

interface GhostConfig {
	contentApiKey: string;
	apiUrl: string;
}

interface TypesenseConfig {
	apiKey: string;
	apiUrl: string;
}

interface ChainsUnderMaintenance {
	[key: string]: string;
}

export interface Config {
	siteMode: SiteMode;
	backendUrl: string;
	ghost: GhostConfig;
	typesense: TypesenseConfig;
	chainsUnderMaintenance: ChainsUnderMaintenance;
}

export default {
	/**
	 * Load Site Mode and fail loudly if not a valid value
	 * - some site features depend on whether we run prod, staging or local dev
	 * - defaults to "local"
	 */
	get siteMode() {
		const siteMode = getEnv('SITE_MODE') || 'local';
		if (!['production', 'staging', 'local'].includes(siteMode)) {
			throw new Error(`Bad site mode ${siteMode}`);
		}
		return siteMode as SiteMode;
	},

	/**
	 * Load Backend URL and fail loudly if not set
	 */
	get backendUrl() {
		const backendUrl = getEnv('BACKEND_URL');
		if (!backendUrl) {
			throw new Error(`${prefix}BACKEND_URL missing`);
		} else if (backendUrl.endsWith('/')) {
			throw new Error(`Backend URL cannot end with slash: ${backendUrl}`);
		}
		return backendUrl;
	},

	/**
	 * Load Ghost API credentials and warn if not available.
	 */
	get ghost() {
		const contentApiKey = getEnv('GHOST_CONTENT_API_KEY');
		const apiUrl = getEnv('GHOST_API_URL');
		if (!contentApiKey || !apiUrl) {
			console.warn('You need configure Ghost API keys to render the blog');
		}
		return { contentApiKey, apiUrl } as GhostConfig;
	},

	/**
	 * Load Typesense config options and warn if not available.
	 */
	get typesense() {
		const apiKey = getEnv('TYPESENSE_API_KEY');
		const apiUrl = getEnv('TYPESENSE_API_URL');
		if (!apiKey || !apiUrl) {
			console.warn('You need to configure Typesense options to enable search');
		}
		return { apiKey, apiUrl } as TypesenseConfig;
	},

	/**
	 * Specify chains under maintence as JSON string, e.g.:
	 * TS_PUBLIC_CHAINS_UNDER_MAINTENANCE='{ "binance": "BNB Chain" }'
	 *
	 * See: checkChainMaintenance
	 */
	get chainsUnderMaintenance() {
		const jsonStr = getEnv('CHAINS_UNDER_MAINTENANCE') || '{}';
		try {
			return JSON.parse(jsonStr) as ChainsUnderMaintenance;
		} catch (e) {
			console.warn(`${prefix}CHAINS_UNDER_MAINTENANCE is not valid JSON`, jsonStr);
			return {} as ChainsUnderMaintenance;
		}
	}
};
