/**
 * Express.js based SvelteKit server-side renderer.
 */

import { randomBytes } from 'node:crypto';
import express from 'express';
import { createCacheScheduler } from './cache-scheduler.js';
import { getStaticCacheControl } from './static-cache-control.js';

// Longer than the sum of the `all` job's task deadlines in src/lib/server/warm-tasks.ts.
const warmRequestTimeoutMilliseconds = 45 * 60 * 1000;

// This secret exists only inside this adapter-node process. It lets the local
// scheduler use a regular SvelteKit request without exposing a public trigger.
process.env.TS_PRIVATE_INTERNAL_REFRESH_TOKEN = randomBytes(32).toString('base64url');

// Import after creating the token: $env/dynamic/private is read when the built
// SvelteKit handler loads the protected warm endpoint.
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

/**
 * Cache lifetimes for the fonts and avatars under `static/`.
 *
 * These files are served by adapter-node's built-in static file server (`sirv`), which sits
 * in front of the SvelteKit renderer inside `handler`. That has two effects worth knowing:
 *
 * - `src/hooks.server.ts` never sees these requests, so the header cannot be set there.
 * - `sirv` only writes `Cache-Control` for the hashed `/_app/immutable/` build assets. For
 *   the rest of `static/` it sends nothing, and Cloudflare then applies its four-hour zone
 *   default — which meant every browser re-downloaded ~130 KB of never-changing font files
 *   after four hours (flagged by PageSpeed Insights in the 2026-09 audit).
 *
 * Setting the header here, before `handler`, works because `sirv` leaves an existing
 * `Cache-Control` untouched. The values and the reasoning behind each lifetime live in
 * `scripts/static-cache-control.js`.
 */
app.use((req, res, next) => {
	const cacheControl = getStaticCacheControl(req.path);
	if (cacheControl) res.setHeader('cache-control', cacheControl);
	next();
});

// Install SvelteKit server-side renderer
app.use(handler);

/**
 * Run one cache-warmer job through the protected loopback endpoint and log its outcome.
 *
 * @param {'all' | 'frequent'} job
 */
async function runCacheWarmJob(job) {
	const startedAt = performance.now();
	const response = await fetch(`http://127.0.0.1:3000/_internal/cache/warm?job=${job}`, {
		method: 'POST',
		headers: { authorization: `Bearer ${process.env.TS_PRIVATE_INTERNAL_REFRESH_TOKEN}` },
		signal: AbortSignal.timeout(warmRequestTimeoutMilliseconds)
	});
	if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
	const result = await response.json();
	const summary = result.tasks
		.map(
			(task) =>
				`${task.name} ${task.status} ${task.durationMs}ms (stall ${task.maxEventLoopDelayMs ?? 0}ms, ${task.rssMb} MB)`
		)
		.join(', ');
	const log = result.failed ? console.warn : console.log;
	log(`[cache-warmer] ${job} job done in ${Math.round(performance.now() - startedAt)}ms: ${summary}`);
}

const cacheScheduler = createCacheScheduler({ trigger: runCacheWarmJob });

// Start web server
app.listen(3000, () => {
	console.log('Listening on port 3000');
	cacheScheduler.start();
});
