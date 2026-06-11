/**
 * Express.js based SvelteKit server-side renderer.
 */

// Check your SvelteKit build/handler.js file
// location based on your SvelteKit installation
import { handler } from '../build/handler.js';
import express from 'express';

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

// Start web server
app.listen(3000, () => {
	console.log('Listening on port 3000');
});
