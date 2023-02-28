import type { Handle, HandleFetch } from '@sveltejs/kit';
import { backendUrl, backendInternalUrl } from '$lib/config';
import { addYears } from 'date-fns';

// Set `data-color-mode` body attribute during SSR to avoid FOUC
// see app.html and ColorModePicker.svelte
export const handle = (({ event, resolve }) => {
	const colorMode = event.cookies.get('color-mode') || 'system';

	// update the cookie (in case not set and to update expiration)
	event.cookies.set('color-mode', colorMode, {
		httpOnly: false,
		secure: false,
		path: '/',
		expires: addYears(new Date(), 1)
	});

	return resolve(event, {
		transformPageChunk({ html }) {
			return html.replace(/%ts:color-mode%/, colorMode);
		}
	});
}) satisfies Handle;

// Shortcut fetch() API requests in SSR; see:
// https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
export const handleFetch = (async ({ request }) => {
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
}) satisfies HandleFetch;
