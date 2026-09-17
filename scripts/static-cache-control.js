/**
 * `Cache-Control` policy for files served straight from `static/` (fonts, avatars).
 *
 * Why this file exists at all
 * ---------------------------
 * The production server (`scripts/server.js`) is an Express app that wraps adapter-node's
 * request handler (`build/handler.js`). Inside that handler, static files are served by
 * `sirv` *before* the SvelteKit server-side renderer gets the request. Two consequences:
 *
 * 1. Nothing in `src/hooks.server.ts` runs for a font or avatar request — the `handle`
 *    hook only wraps the SSR part of the chain. Setting these headers there does nothing.
 * 2. `sirv` writes a `Cache-Control` header for one thing only: the content-hashed files
 *    under `/_app/immutable/` (a year, `immutable`). For everything else under `static/`
 *    it sends no cache header, because adapter-node has no way of knowing which of those
 *    files are safe to cache for how long.
 *
 * With no header from the origin, Cloudflare applies its zone default: `max-age=14400`
 * (four hours) to the browser. On every visit after four hours the browser re-fetched
 * ~130 KB of font files that never change, and PageSpeed Insights charged 100–1,150 KB
 * per page to "inefficient cache lifetimes" in the September 2026 SEO audit.
 *
 * `scripts/server.js` therefore sets the header itself, in middleware that runs before
 * the adapter-node handler. `sirv` only *sets* `Cache-Control` when it has one to set
 * (see the `/_app/immutable/` case above); a header already present on the response is
 * left alone, so the value chosen here is what reaches Cloudflare and the browser.
 *
 * Why the lifetimes differ
 * ------------------------
 * A long lifetime is only safe for a URL whose bytes never change in place; otherwise
 * browsers keep serving the old bytes until the lifetime runs out. Each pattern below
 * follows how that path is versioned:
 *
 * - `/fonts/<family>/<weight>.woff2` — the font files are never edited in place. When a
 *   face changes it gets a new file name, and the stylesheet that references the files is
 *   renamed as well (`fonts5.css` became `fonts6.css` when the unused faces were dropped).
 *   One year and `immutable`, the same policy sirv applies to hashed build assets.
 * - `/fonts/<name>.css` — the stylesheet is renamed on change, but the *old* name keeps
 *   being requested by pages cached elsewhere until they expire, and a year-long cache of
 *   a stale name would pin those pages to old `@font-face` rules. One day.
 * - `/avatars/*` — strategy icons, replaced in place now and then when a strategy gets a
 *   new logo. One day in the browser, and `stale-while-revalidate` for a week so a
 *   replaced icon shows up on the next visit without a blocking refetch.
 *
 * Anything not matched here (robots.txt, favicon, the verification files, …) is left to
 * the handler, i.e. no cache header, as before.
 *
 * Why plain JavaScript
 * --------------------
 * `scripts/server.js` runs against the built output in the container, where nothing under
 * `src/` exists, so this cannot be a `$lib` module. `vitest` includes `scripts/**` so it is
 * still unit-tested (`static-cache-control.test.js`).
 *
 * `vite preview` bypasses `scripts/server.js` entirely, so these headers are absent in the
 * integration test harness and in local previews. Verify with `pnpm run build` followed by
 * `node scripts/server.js`, or against production.
 */

const ONE_DAY = 60 * 60 * 24;
const ONE_YEAR = ONE_DAY * 365;

/**
 * Ordered list of `[path pattern, header value]`; the first matching pattern wins.
 *
 * @type {[pattern: RegExp, cacheControl: string][]}
 */
const policies = [
	// Font files: never change in place (renamed instead), so cache like a hashed asset.
	// `immutable` additionally tells browsers not to revalidate even on a reload.
	[/^\/fonts\/.+\.woff2$/, `public, max-age=${ONE_YEAR}, immutable`],

	// Font stylesheet: renamed on change, but the old name must not stay pinned for a year.
	[/^\/fonts\/.+\.css$/, `public, max-age=${ONE_DAY}`],

	// Strategy avatars: same file name after a logo change, so keep the browser copy short-lived
	// and let it be refreshed in the background rather than on the critical path.
	[/^\/avatars\//, `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_DAY * 7}`]
];

/**
 * Resolve the `Cache-Control` value for a request path.
 *
 * @param {string} pathname request path, e.g. `/fonts/NeueHaasGroteskText/55.woff2`
 * @returns {string | undefined} the header value, or `undefined` for paths this policy does not cover
 */
export function getStaticCacheControl(pathname) {
	return policies.find(([pattern]) => pattern.test(pathname))?.[1];
}
