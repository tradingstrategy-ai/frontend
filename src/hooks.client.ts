import type { ClientInit } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';

export const handleError = Sentry.handleErrorWithSentry();

// Sentry.init must run inside `init` so that $env/dynamic/public is available.
// Accessing it at module evaluation time fails because globalThis.__sveltekit_*
// is not yet set when hooks.client.ts is first evaluated.
export const init: ClientInit = async () => {
	Sentry.init({
		dsn: env['TS_PUBLIC_SENTRY_DSN'],
		sendDefaultPii: true,
		environment: env['TS_PUBLIC_SITE_MODE'] || 'local',
		release: `frontend@${env['TS_PUBLIC_FRONTEND_VERSION_TAG']}`,
		tracesSampleRate: 0.1
	});
};
