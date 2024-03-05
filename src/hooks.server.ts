import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { backendUrl, backendInternalUrl, sentryDsn, siteMode, version } from '$lib/config';
import { addYears } from 'date-fns';
import { countryCodeSchema } from '$lib/helpers/geo';

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

/**
 * Lightweight auth solution for enabling admin-role features - e.g.,
 * displaying "hidden" strategies (test or unpublished strategies).
 *
 * Global admin password is set via TS_PRIVATE_ADMIN_PW env variable
 * Appropriate users can enable admin role via ?pw URL parameter
 *
 * This is not intended to be a strong security measure and should
 * not be used for restricting access to genuinely sensitive data.
 */
const handleAdminRole: Handle = async ({ event, resolve }) => {
	// update or delete pw cookie if ?pw URL param is present
	const urlPw = event.url.searchParams.get('pw');
	if (urlPw !== null) {
		event.cookies.set('pw', urlPw, {
			path: '/',
			expires: urlPw ? addYears(new Date(), 1) : new Date(0)
		});
	}

	// set admin role if pw cookie matches configured global admin pw
	const envPw = env.TS_PRIVATE_ADMIN_PW;
	const cookiePw = event.cookies.get('pw');
	if (envPw && cookiePw && cookiePw === envPw) {
		event.locals.admin = true;
	}

	return resolve(event);
};

const handleIpCountry: Handle = async ({ event, resolve }) => {
	const ipCountry = event.request.headers.get('CF-IPCountry');

	if (ipCountry) {
		try {
			event.locals.ipCountry = countryCodeSchema.parse(ipCountry);
		} catch (e) {
			console.warn(`Invalid CF-IPCountry: ${ipCountry}`);
		}
	}

	return resolve(event);
};

// prettier-ignore
export const handle = sequence(
	Sentry.sentryHandle(),
	handleColorMode,
	handleAdminRole,
	handleIpCountry
);
