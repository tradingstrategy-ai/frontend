import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { backendUrl, backendInternalUrl, sentryDsn, siteMode, version } from '$lib/config';
import { addYears } from 'date-fns';

Sentry.init({
	dsn: sentryDsn,
	environment: siteMode,
	release: `frontend@${version}`
});

// Shortcut fetch() API requests in SSR; see:
// https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
export async function handleFetch({ request }) {
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
}

export const handleError = Sentry.handleErrorWithSentry((async ({ error }) => {
	console.error(error);
	const eventId = Sentry.lastEventId();
	if (eventId) {
		return { message: 'Internal Server Error', eventId };
	}
}) as HandleServerError);

const handleColorMode: Handle = async ({ event, resolve }) => {
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
};

export const handle = sequence(Sentry.sentryHandle(), handleColorMode);
