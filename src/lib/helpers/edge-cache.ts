/**
 * File extensions that let Cloudflare cache our generated images and chart data.
 *
 * Cloudflare's default cache rules cache by file extension only, never by `Content-Type`,
 * and do not cache JSON or extensionless URLs at all (see
 * https://developers.cloudflare.com/cache/concepts/default-cache-behavior/). So the share
 * images, metadata logos and chart-data endpoints went to the origin on every request,
 * whatever their `Cache-Control` said.
 *
 * The links therefore carry an extension from Cloudflare's default list: the image type
 * where it is known (`.png`, `.webp`, `.avif`), and `.bin` for JSON chart data and logos in
 * their original upstream format. `Content-Type` stays accurate (`application/json`,
 * `image/png` …), and `fetch().json()` ignores the extension. The `reroute` hook strips the
 * extension before route matching, so the existing endpoints serve both forms and links
 * without an extension (old pages still open in browsers, external embeds) keep working.
 */

/** `Cache-Control` for edge-cacheable responses that do not set their own */
export const EDGE_CACHE_DEFAULT_CONTROL = 'public, max-age=86400, stale-while-revalidate=86400';

/** Extension for JSON chart data: `.json` is not in Cloudflare's default cached list */
export const CHART_DATA_EXTENSION = '.bin';

/** Paths with a cache extension, and the extension-less path the route is registered under */
const EDGE_CACHE_PATHS: RegExp[] = [
	/^(\/(?:top-vaults|vaults(?:\/[^?#]+)?)\/chart-data)\.bin$/,
	/^(\/vaults\/[^/]+\/metrics)\.bin$/,
	/^(\/social-card\/[^.]+)\.png$/,
	/^(\/metadata-logo\/[^/]+\/[^/]+)\.(?:webp|avif|bin)$/
];

/**
 * The route path for a request path that carries a cache extension, or `undefined` when it
 * carries none.
 *
 * @param pathname request path, e.g. `/vaults/protocols/morpho/chart-data.bin`
 */
export function stripEdgeCacheExtension(pathname: string): string | undefined {
	for (const pattern of EDGE_CACHE_PATHS) {
		const match = pattern.exec(pathname);
		if (match) return match[1];
	}
	return undefined;
}

/**
 * Add the chart-data extension to an endpoint path, keeping any query string.
 *
 * @param path e.g. `/vaults/protocols/morpho/chart-data?window=30d`
 * @example chartDataUrl('/vaults/compare/chart-data?vault=a') → '/vaults/compare/chart-data.bin?vault=a'
 */
export function chartDataUrl(path: string): string {
	const queryStart = path.indexOf('?');
	return queryStart === -1
		? `${path}${CHART_DATA_EXTENSION}`
		: `${path.slice(0, queryStart)}${CHART_DATA_EXTENSION}${path.slice(queryStart)}`;
}
