import type { ClientInit } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';

export const handleError = Sentry.handleErrorWithSentry();

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
