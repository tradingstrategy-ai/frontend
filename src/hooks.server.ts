import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { backendUrl, backendInternalUrl, sentryDsn, siteMode, strategyMicrosite, version } from '$lib/config';
import { countryCodeSchema } from '$lib/helpers/geo';
import { parseDate } from '$lib/helpers/date';
import { diagnoseFetch } from '$lib/diagnostics/server';
import { signozSentryOptions, installConsoleLogBridge } from '$lib/server/signoz-telemetry';
import { getFontPreloadLinks } from '$lib/server/font-preload';

const defaultColorMode = 'dark';

const adminPw = env.TS_PRIVATE_ADMIN_PW;

Sentry.init({
	dsn: sentryDsn,
	sendDefaultPii: true,
	environment: siteMode,
	release: `frontend@${version}`,
	tracesSampleRate: 0.1,
	// SigNoz OTLP trace export (no-op unless OTEL_EXPORTER_OTLP_ENDPOINT is set);
	// overrides tracesSampleRate when enabled — see $lib/server/signoz-telemetry
	...signozSentryOptions()
});

installConsoleLogBridge();

/**
 * Use internal network for server-side fetch() requests; see:
 * https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile
 */
export async function handleFetch({ request, fetch }) {
	if (backendInternalUrl && request.url.startsWith(backendUrl)) {
		request = new Request(request.url.replace(backendUrl, backendInternalUrl), request);
	}
	return diagnoseFetch(request, fetch);
}

export const handleError = Sentry.handleErrorWithSentry((async ({ error }) => {
	console.error(error);
	const eventId = Sentry.lastEventId();
	if (eventId) {
		return { message: 'Internal Server Error', eventId };
	}
}) as HandleServerError);

/**
 * Set data-color-mode property of <html> tag for CSS-based theming with no FOUC
 */
const handleColorMode: Handle = async ({ event, resolve }) => {
	let colorMode: string = defaultColorMode;

	if (!strategyMicrosite) {
		colorMode = event.cookies.get('ts-color-mode') ?? defaultColorMode;
	}

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
	// get pw from URL param or cookie
	const pw = event.url.searchParams.get('pw') ?? event.cookies.get('pw');

	// set admin role if pw matches configured admin pw
	if (adminPw && pw && pw === adminPw) {
		event.locals.admin = true;
	}

	return resolve(event);
};

/**
 * Set podcastAnnouncementDismissedAt local based on cookie
 */
const handlePodcastAnnouncement: Handle = async ({ event, resolve }) => {
	const dismissedAtStr = event.cookies.get('podcast-announcement-dismissed-at');
	event.locals.podcastAnnouncementDismissedAt = parseDate(dismissedAtStr);
	return resolve(event);
};

/**
 * Add `Link` preload headers for the web fonts to HTML responses; see `$lib/server/font-preload`.
 */
const handleFontPreload: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (response.headers.get('content-type')?.startsWith('text/html')) {
		response.headers.append('Link', getFontPreloadLinks(event.url.pathname));
	}
	return response;
};

/**
 * Keep generated image endpoints out of search indexes.
 *
 * `og:image` URLs (`/social-card/…`, including its `?fallback=` redirects) and resized
 * protocol logos (`/metadata-logo/…`) get crawled like pages and made up ~45 % of the
 * "crawled – currently not indexed" report in the 2026-09 audit. Images cannot carry a
 * robots meta tag, so the header is the only signal; robots.txt must keep allowing them
 * because social scrapers (and Google's own og:image fetch) need to read them.
 *
 * Applied in a hook rather than per `Response` so the redirect and error branches of
 * the endpoints are covered too.
 */
const NOINDEX_IMAGE_PATH_PATTERN = /^\/(social-card|metadata-logo)\//;

const handleImageEndpointRobots: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (NOINDEX_IMAGE_PATH_PATTERN.test(event.url.pathname)) {
		response.headers.set('X-Robots-Tag', 'noindex');
	}
	return response;
};

/**
 * Set ipCounry local based on Cloudflare request header
 */
const handleIpCountry: Handle = async ({ event, resolve }) => {
	const ipCountry = event.request.headers.get('CF-IPCountry');

	if (ipCountry) {
		try {
			event.locals.ipCountry = countryCodeSchema.parse(ipCountry);
		} catch {
			console.warn(`Invalid CF-IPCountry: ${ipCountry}`);
		}
	}

	return resolve(event);
};

export const handle = sequence(
	Sentry.sentryHandle(),
	handleColorMode,
	handleAdminRole,
	handlePodcastAnnouncement,
	handleIpCountry,
	handleImageEndpointRobots,
	handleFontPreload
);
