import type { Handle, HandleFetch } from '@sveltejs/kit';
import { backendUrl, backendInternalUrl } from '$lib/config';

/**
 * Shortcut fetch() API requests in SSR; see:
 * https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
 *
 */
export const handleFetch: HandleFetch = async ({ request }) => {
	if (backendInternalUrl) {
		// replace backendUrl to use the internal network
		if (request.url.startsWith(backendUrl)) {
			request = new Request(request.url.replace(backendUrl, backendInternalUrl), request);
			// set headers to enable backend to determine the original request origin
			const url = new URL(backendUrl);
			request.headers.set('Host', url.hostname);
			request.headers.set('X-Forwarded-Host', url.hostname);
			request.headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
		}
	}
	return fetch(request);
};
