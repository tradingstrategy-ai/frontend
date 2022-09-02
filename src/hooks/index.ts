import type { ExternalFetch } from '@sveltejs/kit';
import { backendUrl, backendInternalUrl } from '$lib/config';

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
