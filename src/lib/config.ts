// https://stackoverflow.com/questions/68479217/how-to-load-environment-variables-in-svelte

/**
 * Load Backend URL and fail loudly if not set
 */
export const backendUrl = (({ VITE_PUBLIC_BACKEND_URL }) => {
	if (!VITE_PUBLIC_BACKEND_URL) {
		throw new Error('VITE_PUBLIC_BACKEND_URL missing');
	} else if (VITE_PUBLIC_BACKEND_URL.endsWith('/')) {
		throw new Error(`Backend URL cannot end with slash: ${backendUrl}`);
	}
	return VITE_PUBLIC_BACKEND_URL;
})(import.meta.env);

/**
 * Load Ghost API credentials and warn if not available.
 */
export const ghostConfig = ((env) => {
	const contentApiKey = env.VITE_PUBLIC_GHOST_CONTENT_API_KEY;
	const apiUrl = env.VITE_PUBLIC_GHOST_API_URL;
	if (!contentApiKey || !apiUrl) {
		console.warn('You need configure Ghost API keys to render the blog');
	}
	return { contentApiKey, apiUrl };
})(import.meta.env);

/**
 * Load Typesense config options and warn if not available.
 */
export const typesenseConfig = ((env) => {
	const apiKey = env.VITE_PUBLIC_TYPESENSE_API_KEY;
	const apiUrl = env.VITE_PUBLIC_TYPESENSE_API_URL;
	if (!apiKey || !apiUrl) {
		console.warn('You need to configure Typesense options to enable search');
	}
	return { apiKey, apiUrl };
})(import.meta.env);

/**
 * Load Site Mode and fail loudly if not a valid value
 * - some site features depending on whether we run prod, staging or local dev
 * - defaults to "local"
 */
export const siteMode = (({ VITE_SITE_MODE = 'local' }) => {
	if (!['production', 'staging', 'local'].includes(VITE_SITE_MODE)) {
		throw new Error(`Bad site mode ${VITE_SITE_MODE}`);
	}
	return VITE_SITE_MODE;
})(import.meta.env);

/**
 * See isChainInMaintenance()
 *
 * TODO: Make this environment variable based or to be received from the backend.
 */
export const chainsUnderMaintenance = {
	binance: 'BNB Chain'
};
