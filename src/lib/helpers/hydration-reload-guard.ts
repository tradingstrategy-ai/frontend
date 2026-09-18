/**
 * Circuit breaker for SvelteKit's hydration reload loop on edge-cached pages.
 *
 * The problem
 * -----------
 * Cloudflare keeps serving an edge-cached page (`Cache-Control: public, max-age=…`, see
 * `docs/cache-invalidation.md`) while the Node origin is down. Hydrating that page needs the
 * route's JavaScript chunks (`/_app/immutable/nodes/*.js`), which the SvelteKit client
 * `import()`s. Everything else hydration needs is inlined in the HTML, so a chunk that is not
 * cached at that particular edge is the *only* request that reaches the dead origin — and it
 * gets a 502.
 *
 * SvelteKit's reaction to a chunk import failing during hydration is:
 *
 * 1. render its error page — which, because the root `+layout.server.ts` has a server `load`,
 *    first fetches `/__data.json?x-sveltekit-invalidated=1` from the origin (502 again);
 * 2. fall back to a full reload of the same URL (`location.href = url`), on the assumption that
 *    the origin will render an error page server-side.
 *
 * SvelteKit's own guard against reloading into a loop only applies while `hydrated` is false,
 * but `_hydrate()` sets `hydrated = true` on its first line, so the guard never covers this
 * case. With a cached page and a dead origin the reload serves the same HTML, which fails the
 * same way: an infinite reload loop (measured at ~130 loads in 8 seconds).
 *
 * The fix
 * -------
 * `src/hooks.client.ts` calls these helpers from `handleError`, the one hook that runs between
 * the failed import and the fallback reload. The first reload is allowed through, since it
 * resolves the transient cases (edge briefly out of sync, a chunk from a deploy still
 * propagating). A repeat failure of the *same URL* within a short window is treated as the loop
 * and hydration is aborted by throwing, which leaves the server-rendered HTML on screen with
 * plain links instead of reloading forever.
 *
 * State is kept in `sessionStorage` because it survives the reload but is scoped to the tab, so
 * one broken tab cannot influence another.
 */

/**
 * Consecutive failures of the same URL within this window count as a loop.
 *
 * A loop iteration takes well under a second, so a minute is generous; it is short enough that
 * a human retrying a few minutes later is treated as a fresh attempt.
 */
export const RELOAD_LOOP_WINDOW_MS = 60_000;

/** `sessionStorage` key holding the last failure record. */
export const RELOAD_LOOP_STORAGE_KEY = 'ts:hydration-reload-guard';

/**
 * Number of SvelteKit reloads to allow before aborting. One: the second failure of the same
 * URL already proves the reload did not help.
 */
const MAX_RELOADS = 1;

/** What is persisted between reloads. */
type FailureRecord = {
	/** URL of the page that failed to hydrate */
	href: string;
	/** consecutive failures of `href` within the window, including this one */
	failures: number;
	/** `Date.now()` of the latest failure */
	at: number;
};

/**
 * Whether an error is a browser failing to load an ES module chunk.
 *
 * Only these errors are eligible for the guard: any other hydration error should keep
 * SvelteKit's default behaviour. The message wording is browser-specific:
 *
 * - Chromium: "Failed to fetch dynamically imported module: …"
 * - Firefox:  "error loading dynamically imported module: …"
 * - Safari:   "Importing a module script failed."
 *
 * @param error - the value SvelteKit passed to `handleError`
 */
export function isModuleLoadError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return /dynamically imported module|Importing a module script failed/i.test(message);
}

/**
 * Record a module-load failure for `href` and report whether hydration should be aborted
 * instead of letting SvelteKit reload the page again.
 *
 * @param href - URL of the page that failed to hydrate
 * @param storage - `sessionStorage`, or undefined where it is unavailable; only
 *   `getItem`/`setItem` are used so tests can pass a stub
 * @param now - current time in milliseconds, injectable for tests
 * @returns true when this URL already failed the same way within the window
 */
export function shouldAbortReload(
	href: string,
	storage: Pick<Storage, 'getItem' | 'setItem'> | undefined,
	now = Date.now()
): boolean {
	// Without storage the count cannot survive a reload, so the loop cannot be detected;
	// keep SvelteKit's default reload rather than aborting on every first failure.
	if (!storage) return false;

	// Read the previous record. Storage access can throw (browsers set to block site data,
	// private windows on some engines) and the value may be corrupt; either counts as no history.
	let previous: FailureRecord | undefined;
	try {
		const raw = storage.getItem(RELOAD_LOOP_STORAGE_KEY);
		if (raw) previous = JSON.parse(raw) as FailureRecord;
	} catch {
		previous = undefined;
	}

	// Only a failure of the *same* URL, recently, continues the sequence; anything else starts at 1.
	const failures =
		previous && previous.href === href && now - previous.at < RELOAD_LOOP_WINDOW_MS ? previous.failures + 1 : 1;

	// Persist before deciding, so the next reload sees this failure.
	try {
		storage.setItem(RELOAD_LOOP_STORAGE_KEY, JSON.stringify({ href, failures, at: now } satisfies FailureRecord));
	} catch {
		// Same as no storage: the failure cannot be remembered, so do not abort.
		return false;
	}

	return failures > MAX_RELOADS;
}
