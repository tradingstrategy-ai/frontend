import * as Sentry from '@sentry/sveltekit';
import { sentryDsn, siteMode, version } from '$lib/config';

Sentry.init({
	dsn: sentryDsn,
	environment: siteMode,
	release: `frontend@${version}`,
	tracesSampleRate: 0.1
});

export const handleError = Sentry.handleErrorWithSentry();
