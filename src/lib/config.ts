// https://stackoverflow.com/questions/68479217/how-to-load-environment-variables-in-svelte

/**
 * Load Backend URL and fail loudly if not set
 */
export const backendUrl = (({ VITE_PUBLIC_BACKEND_URL: BACKEND_URL }) => {
	if (!BACKEND_URL) {
		throw new Error('VITE_PUBLIC_BACKEND_URL missing');
	} else if (BACKEND_URL.endsWith('/')) {
		throw new Error(`Backend URL cannot end with slash: ${BACKEND_URL}`);
	}
	return BACKEND_URL;
})(import.meta.env);

/**
 * Backend internal URL (optional); set this when running frontend and backend on the
 * same host or same local network (e.g., production). See: hooks/index.ts:externalFetch
 */
export const backendInternalUrl = (({ VITE_PUBLIC_BACKEND_INTERNAL_URL: INTERNAL_URL }) => {
	if (INTERNAL_URL?.endsWith('/')) {
		throw new Error(`Backend internal URL cannot end with slash: ${INTERNAL_URL}`);
	}
	return INTERNAL_URL;
})(import.meta.env);

/**
 * Load Site Mode and fail loudly if not a valid value
 * - some site features depend on whether we run prod, staging or local dev
 * - defaults to "local"
 */
export const siteMode = (({ VITE_SITE_MODE = 'local' }) => {
	if (!['production', 'staging', 'local'].includes(VITE_SITE_MODE)) {
		throw new Error(`Bad site mode ${VITE_SITE_MODE}`);
	}
	return VITE_SITE_MODE;
})(import.meta.env);

/**
 * Specify chains under maintence as JSON string, e.g.:
 * VITE_PUBLIC_CHAINS_UNDER_MAINTENANCE='{ "binance": "BNB Chain" }'
 *
 * NOTE: fresh `npm run build` is required for update to take effect.
 *
 * See: checkChainMaintenance
 */
export const chainsUnderMaintenance = ((env) => {
	const jsonStr = env.VITE_PUBLIC_CHAINS_UNDER_MAINTENANCE || '{}';
	try {
		return JSON.parse(jsonStr);
	} catch (e) {
		console.warn('VITE_PUBLIC_CHAINS_UNDER_MAINTENANCE is not valid JSON', jsonStr);
		return {};
	}
})(import.meta.env);
