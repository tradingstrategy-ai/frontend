/**
 * `Cache-Control` for files served straight from `static/`.
 *
 * Plain JavaScript because `scripts/server.js` runs against the built output, where nothing
 * under `src/` exists.
 *
 * adapter-node serves `static/` with sirv before the SvelteKit handler runs, so `hooks.server.ts`
 * never sees these requests, and sirv itself only sets a cache lifetime for the hashed
 * `/_app/immutable/` assets. Without a header Cloudflare applies its four-hour zone default,
 * which is what the 2026-09 audit flagged for fonts and avatars. `scripts/server.js` applies
 * this policy as Express middleware ahead of the handler; sirv keeps a header that is already set.
 *
 * Lifetimes follow how each path is versioned:
 * - `/fonts/*.woff2` never change in place (a changed face gets a new file name; the stylesheet
 *   that references them is renamed too, e.g. `fonts5.css` → `fonts6.css`), so a year is safe.
 * - `/fonts/*.css` is renamed on change but the *old* name must not linger: one day.
 * - `/avatars/*` are replaced in place occasionally: one day, with stale-while-revalidate.
 */

const ONE_DAY = 60 * 60 * 24;
const ONE_YEAR = ONE_DAY * 365;

/** @type {[pattern: RegExp, cacheControl: string][]} */
const policies = [
	[/^\/fonts\/.+\.woff2$/, `public, max-age=${ONE_YEAR}, immutable`],
	[/^\/fonts\/.+\.css$/, `public, max-age=${ONE_DAY}`],
	[/^\/avatars\//, `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_DAY * 7}`]
];

/**
 * @param {string} pathname request path, e.g. `/fonts/NeueHaasGroteskText/55.woff2`
 * @returns {string | undefined} the header value, or `undefined` for paths this policy does not cover
 */
export function getStaticCacheControl(pathname) {
	return policies.find(([pattern]) => pattern.test(pathname))?.[1];
}
