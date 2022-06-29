import { backendUrl } from '$lib/config';

import config from './config';

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession(event) {
	return { config };
}

/**
 * Shortcut fetch() API requests in SSR; see:
 * https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
 */
export async function externalFetch(request: Request): Promise<Response> {
	if (config.backendInternalUrl) {
		// replace backendUrl to use the internal network
		if (request.url.startsWith(backendUrl)) {
			request = new Request(request.url.replace(backendUrl, config.backendInternalUrl), request);
		}
	}

	return fetch(request);
}
