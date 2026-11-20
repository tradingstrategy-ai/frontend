import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { backendUrl, backendInternalUrl, sentryDsn, siteMode, strategyMicrosite, version } from '$lib/config';
import { countryCodeSchema } from '$lib/helpers/geo';
import { diagnoseFetch } from '$lib/diagnostics/server';
import { signozSentryOptions, installConsoleLogBridge } from '$lib/server/signoz-telemetry';
import { EDGE_CACHE_DEFAULT_CONTROL, stripEdgeCacheExtension } from '$lib/helpers/edge-cache';
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
 * Response headers that depend on the URL or content type:
 *
 * - `Link` preloads for the web fonts on HTML responses (Cloudflare turns them into 103
 *   Early Hints); see `$lib/server/font-preload`. Sitemaps, JSON and images get none.
 * - No `modulepreload` entries in SvelteKit's own `Link` header, only the stylesheets
 *   (`preload` below; the default is JS and CSS). On a server-rendered page SvelteKit lists
 *   every JS chunk of the route there — about 100 files and 200–250 KB on vault and hub
 *   pages — and Cloudflare sends them as Early Hints, so they start before the HTML and
 *   share the mobile bandwidth with the 15–20 KB of render-blocking CSS. In the 2026-11
 *   lab measurements this moved first paint from 1.9–4.1 s to 0.9–1.2 s. The chunks are
 *   still fetched in parallel once the start script runs: Vite's dynamic-import preload
 *   lists each route node's dependencies.
 * - `X-Robots-Tag: noindex` on the generated image endpoints. `og:image` URLs
 *   (`/social-card/…`, including their `?fallback=` redirects) and resized protocol logos
 *   (`/metadata-logo/…`) get crawled like pages and were 45 % of a 1,000-URL sample of the
 *   "crawled – currently not indexed" report in the 2026-09 audit. Images cannot carry a robots meta tag, so the
 *   header is the signal for most crawlers; robots.txt must keep allowing them for social
 *   scrapers. Googlebot kept recrawling the cards regardless (65 % of the same report in
 *   2026-11), so robots.txt disallows `/social-card/` for Googlebot only. Set here rather
 *   than per `Response` so the redirect and error branches of the endpoints are covered too.
 * - A 24-hour `Cache-Control` on successful responses to edge-cacheable URLs (chart data,
 *   share images and metadata logos with a cache extension; see `$lib/helpers/edge-cache`)
 *   that do not set their own, so Cloudflare and browsers cache them.
 */
const NOINDEX_IMAGE_PATH_PATTERN = /^\/(social-card|metadata-logo)\//;

const handleResponseHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, { preload: ({ type }) => type === 'css' });
	const { pathname } = event.url;

	if (response.headers.get('content-type')?.startsWith('text/html')) {
		response.headers.append('Link', getFontPreloadLinks(pathname));
	}
	if (NOINDEX_IMAGE_PATH_PATTERN.test(pathname)) {
		response.headers.set('X-Robots-Tag', 'noindex');
	}
	if (response.status === 200 && !response.headers.has('cache-control') && stripEdgeCacheExtension(pathname)) {
		response.headers.set('cache-control', EDGE_CACHE_DEFAULT_CONTROL);
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
	handleIpCountry,
	handleResponseHeaders
);
