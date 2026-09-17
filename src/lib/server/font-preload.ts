/**
 * Add Link headers for font preloading.
 *
 * Cloudflare caches these Link headers and serves them as HTTP 103 Early Hints
 * on subsequent requests, allowing the browser to start fetching fonts before
 * the full response arrives from the origin.
 *
 * The stylesheet itself is preloaded on every HTML page. The three woff2 files
 * are preloaded on the templates whose above-the-fold content is text in these
 * faces (live mobile audits, 2026-09): home, vault detail, glossary term, token,
 * pair and blog post pages. Their visible typography is dominated by
 * - Neue Haas Grotesk Display 600 for the main page title
 * - Neue Haas Grotesk Text 400 for body copy
 * - Neue Haas Grotesk Text 500 for buttons, links, and large supporting values
 *
 * Other faces (Source Serif Pro, Source Code Pro, Display 400/500/700, Text 700)
 * are lower priority or below the fold and are fetched on demand. Listing pages
 * are left out on purpose: three font preloads would compete with the LCP image
 * or the table data there. With the metric-matched fallbacks in fonts6.css the
 * swap no longer shifts layout, so preloading is only about LCP, not CLS.
 *
 * Only HTML responses get the header — sitemaps, JSON and generated images
 * have no use for it.
 *
 * @see https://developers.cloudflare.com/cache/advanced-configuration/early-hints/
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
 */
const stylesheetPreloadLink = '</fonts/fonts6.css>; rel=preload; as=style';

const fontFilePreloadLinks = [
	'</fonts/NeueHaasGroteskDisplay/65.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
	'</fonts/NeueHaasGroteskText/55.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
	'</fonts/NeueHaasGroteskText/65.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
];

/** Templates whose LCP element is text set in the preloaded faces. */
const fontPreloadPathPatterns = [
	/^\/$/,
	/^\/vaults\/[^/]+$/,
	/^\/glossary\/[^/]+$/,
	/^\/blog\/[^/]+$/,
	/^\/trading-view\/[^/]+\/tokens\/[^/]+$/,
	/^\/trading-view\/[^/]+\/[^/]+\/[^/]+$/
];

export function getFontPreloadLinks(pathname: string): string {
	if (fontPreloadPathPatterns.some((pattern) => pattern.test(pathname))) {
		return [stylesheetPreloadLink, ...fontFilePreloadLinks].join(', ');
	}
	return stylesheetPreloadLink;
}
