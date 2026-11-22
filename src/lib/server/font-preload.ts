/**
 * Add Link headers for font preloading.
 *
 * Cloudflare caches these Link headers and serves them as HTTP 103 Early Hints
 * on subsequent requests, allowing the browser to start fetching fonts before
 * the full response arrives from the origin.
 *
 * The `@font-face` rules are inlined in every page (`$lib/server/font-faces`), so there is
 * no font stylesheet to preload. The three woff2 files are preloaded on the templates whose largest above-the-fold element is text in
 * these faces (vault detail per the 2026-09 mobile audits; glossary term, token,
 * pair and blog post pages by the same reasoning). Their visible typography
 * is dominated by
 * - Neue Haas Grotesk Display 600 for the main page title
 * - Neue Haas Grotesk Text 400 for body copy
 * - Neue Haas Grotesk Text 500 for buttons, links, and large supporting values
 *
 * Other faces (Source Serif Pro, Source Code Pro, Display 400/500/700, Text 700)
 * are lower priority or below the fold and are fetched on demand. Listing pages
 * are left out on purpose: three font preloads would compete with the LCP image
 * or the table data there. The home page is left out for the same reason: in the
 * 2026-11 lab measurements its LCP (the hero) moved from 1.6 s to 0.8 s without them.
 *
 * The faces are `font-display: optional` (static/fonts/fonts7.css), so a preload only helps when
 * the file arrives before the text is first rendered: on a fast connection the first
 * page view is then set in the web font, on slow mobile it stays in the metric-matched
 * fallback for that view and the preload fills the cache for the next page.
 *
 * Only HTML responses get the header — sitemaps, JSON and generated images
 * have no use for it.
 *
 * @see https://developers.cloudflare.com/cache/advanced-configuration/early-hints/
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
 */
const fontFilePreloadLinks = [
	'</fonts/NeueHaasGroteskDisplay/65.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
	'</fonts/NeueHaasGroteskText/55.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
	'</fonts/NeueHaasGroteskText/65.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
];

/** Templates whose LCP element is text set in the preloaded faces. */
const fontPreloadPathPatterns = [
	/^\/vaults\/[^/]+$/,
	/^\/glossary\/[^/]+$/,
	/^\/blog\/[^/]+$/,
	/^\/trading-view\/[^/]+\/tokens\/[^/]+$/,
	/^\/trading-view\/[^/]+\/[^/]+\/(?!export-data$)[^/]+$/
];

/**
 * `Link` header value for a page's font preloads; empty when the page preloads no fonts.
 * The `@font-face` rules themselves are inlined in the HTML (`$lib/server/font-faces`), so
 * there is no font stylesheet to preload.
 *
 * @param pathname request path
 */
export function getFontPreloadLinks(pathname: string): string {
	if (fontPreloadPathPatterns.some((pattern) => pattern.test(pathname))) {
		return fontFilePreloadLinks.join(', ');
	}
	return '';
}
