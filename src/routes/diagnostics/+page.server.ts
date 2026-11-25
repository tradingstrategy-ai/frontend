import { getWarmCacheStatus } from '$lib/server/warm-cache';

export async function load({ request, locals }) {
	return {
		requestHeaders: Object.fromEntries(request.headers),
		// error messages can name upstream URLs, so the cache table is for admins only
		warmCaches: locals.admin ? getWarmCacheStatus() : null
	};
}
