import type { ClientInit } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { sentryDsn, siteMode, version } from '$lib/config';

Sentry.init({
	dsn: sentryDsn,
	sendDefaultPii: true,
	environment: siteMode,
	release: `frontend@${version}`,
	tracesSampleRate: 0.1
});

export const handleError = Sentry.handleErrorWithSentry();

// adding empty init to silence build warning
export const init: ClientInit = async () => {};
