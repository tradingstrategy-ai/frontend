import { init as initSentry, captureException } from '@sentry/node';
import { backendUrl, backendInternalUrl, siteMode, version } from '$lib/config';
import { env } from '$env/dynamic/private';
import { addYears } from 'date-fns';

// Set `data-color-mode` body attribute during SSR to avoid FOUC
// see app.html and ColorModePicker.svelte
export async function handle({ event, resolve }) {
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
}

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

// Sentry error logging; see:
// - https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror
// - https://sentry.io/for/sveltekit/
initSentry({
	dsn: env.TS_PRIVATE_SENTRY_DSN,
	environment: siteMode,
	release: version
});

export async function handleError({ error, event }) {
	const eventData = {
		isDataRequest: event.isDataRequest,
		url: event.url.toString(),
		route: event.route.id,
		params: JSON.stringify(event.params)
	};

	const eventId = captureException(error, { contexts: { sveltekit: { event: eventData } } });

	return {
		message: 'Internal Server Error',
		eventId
	};
}
