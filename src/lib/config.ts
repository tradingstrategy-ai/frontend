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
