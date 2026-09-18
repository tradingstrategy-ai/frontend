import type { ClientInit, HandleClientError } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { navigating } from '$app/state';
import { isModuleLoadError, shouldAbortReload } from '$lib/helpers/hydration-reload-guard';

/**
 * `sessionStorage`, or undefined where merely touching it throws (site data blocked).
 *
 * The guard fails open without storage, so this must not throw out of the hook itself.
 */
function getSessionStorage(): Storage | undefined {
	try {
		return window.sessionStorage;
	} catch {
		return undefined;
	}
}

/**
 * Client-side error hook.
 *
 * Besides producing the `App.Error` shape for the error page, this breaks the reload loop that
 * an edge-cached page falls into when the origin is down and one of the page's JavaScript
 * chunks is missing from the edge cache. SvelteKit calls this hook *before* its fallback
 * (`location.href = url`), so it is the only place the loop can be interrupted. Throwing here
 * rejects `_hydrate()`, which stops hydration and leaves the server-rendered HTML readable.
 * Why this is needed and how the loop arises is documented in
 * `$lib/helpers/hydration-reload-guard` and `docs/cache-invalidation.md`.
 *
 * The breaker is deliberately narrow, because `HandleClientError` is not meant to throw:
 *
 * - only for a browser module-load failure, never for application errors;
 * - only during initial hydration. `navigating.type` is null then and is set before any
 *   client-side navigation's `load_route` runs, so a chunk failure while navigating keeps
 *   SvelteKit's normal handling (nearest error page, or its own single reload). Comparing
 *   `location.href` would not do: on back/forward the browser has already changed it;
 * - only on a repeat failure of the same URL, so a transient failure still recovers through
 *   SvelteKit's first reload.
 */
const handleClientError: HandleClientError = ({ error, event, message }) => {
	const hydrating = navigating.type === null;
	if (hydrating && isModuleLoadError(error) && shouldAbortReload(event.url.href, getSessionStorage())) {
		console.error('Page assets are unavailable and a reload did not help; showing the static page instead.', error);
		throw error;
	}
	// Same shape SvelteKit produces by default when no hook is defined
	return { message };
};

// Sentry captures the error first, then delegates to our handler (throws propagate).
export const handleError = Sentry.handleErrorWithSentry(handleClientError);

// Sentry.init must run inside `init` with a dynamic import of $env/dynamic/public.
// A static top-level import causes the env module to be evaluated at hook module
// load time, before SvelteKit sets up globalThis.__sveltekit_*, which throws:
// "TypeError: can't access property 'env', globalThis.__sveltekit_* is undefined".
export const init: ClientInit = async () => {
	const { env } = await import('$env/dynamic/public');
	Sentry.init({
		dsn: env['TS_PUBLIC_SENTRY_DSN'],
		sendDefaultPii: true,
		environment: env['TS_PUBLIC_SITE_MODE'] || 'local',
		release: `frontend@${env['TS_PUBLIC_FRONTEND_VERSION_TAG']}`,
		tracesSampleRate: 0.1
	});
};
