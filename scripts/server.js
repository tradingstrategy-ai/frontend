/**
 * Express.js based SvelteKit server-side renderer.
 */

import { randomBytes } from 'node:crypto';
import express from 'express';

const refreshIntervalMilliseconds = 20 * 60 * 1000;
const refreshRequestTimeoutMilliseconds = 15 * 60 * 1000;

// This secret exists only inside this adapter-node process. It lets the local
// scheduler use a regular SvelteKit request without exposing a public trigger.
process.env.TS_PRIVATE_STRATEGIES_REFRESH_TOKEN = randomBytes(32).toString('base64url');

// Import after creating the token: $env/dynamic/private is read when the built
// SvelteKit handler loads the protected refresh endpoint.
const { handler } = await import('../build/handler.js');

// web-top-node request tracking removed — no longer needed
// import { Tracker, TrackerServer, createTrackerMiddleware } from '@trading-strategy-ai/web-top-node';

// Create Express server
// Polka does not work https://github.com/sveltejs/kit/issues/6363
const app = express();

/**
 * Prevent caching of SvelteKit's server-side route resolution responses
 * (`<path>/__route.js`, generated because `router.resolution` is `server`
 * in svelte.config.js).
 *
 * SvelteKit answers these requests before the `handle` hook runs and sends
 * no cache-control header, while Cloudflare caches any URL ending in `.js`
 * by default. After a deployment, a stale cached response points an
 * already-loaded page at chunks from the previous build, crashing
 * client-side navigation with "Cannot read properties of undefined
 * (reading 'env')" and a client-rendered 500 error page.
 *
 * The SvelteKit handler only sets content-type on these responses, so a
 * header set here is preserved.
 */
app.use((req, res, next) => {
	if (req.path.endsWith('/__route.js')) {
		res.setHeader('cache-control', 'private, no-cache');
	}
	next();
});

// Install SvelteKit server-side renderer
app.use(handler);

let refreshInFlight = false;

async function refreshStrategiesCache() {
	if (refreshInFlight) {
		console.warn('[strategies-cache] Scheduled refresh skipped because another refresh is still running.');
		return;
	}

	refreshInFlight = true;
	const startedAt = performance.now();
	try {
		const response = await fetch('http://127.0.0.1:3000/_internal/cache/strategies/refresh', {
			method: 'POST',
			headers: { authorization: `Bearer ${process.env.TS_PRIVATE_STRATEGIES_REFRESH_TOKEN}` },
			signal: AbortSignal.timeout(refreshRequestTimeoutMilliseconds)
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
		const result = await response.json();
		console.log(
			`[strategies-cache] Scheduled refresh completed in ${Math.round(performance.now() - startedAt)}ms`,
			result.cache
		);
	} catch (error) {
		const summary = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error';
		console.error(
			`[strategies-cache] Scheduled refresh failed after ${Math.round(performance.now() - startedAt)}ms (${summary}).`
		);
	} finally {
		refreshInFlight = false;
	}
}

// Start web server
app.listen(3000, () => {
	console.log('Listening on port 3000');
	void refreshStrategiesCache();
	const refreshTimer = setInterval(() => void refreshStrategiesCache(), refreshIntervalMilliseconds);
	refreshTimer.unref();
});
