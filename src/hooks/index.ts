import type { ExternalFetch } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const backendUrl = env.TS_PUBLIC_BACKEND_URL;
const backendInternalUrl = env.TS_PUBLIC_BACKEND_INTERNAL_URL;

/**
 * Shortcut fetch() API requests in SSR; see:
 * https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
 *
 */
export const externalFetch: ExternalFetch = async (request) => {
	if (backendInternalUrl) {
		// replace backendUrl to use the internal network
		if (request.url.startsWith(backendUrl)) {
			request = new Request(request.url.replace(backendUrl, backendInternalUrl), request);
		}
	}
	return fetch(request);
};
