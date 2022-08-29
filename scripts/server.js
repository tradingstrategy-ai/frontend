/**
 * Express.js based SvelteKit server-side renderer
 * with web-top HTTP request tracking API installed.
 *
 * To run this you need to set environment variable TOP_WEB_API_KEY
 * to a random string.
 *
 * export TOP_WEB_API_KEY=`node -e "console.log(crypto.randomBytes(20).toString('hex'));"`
 * echo "API key is $TOP_WEB_API_KEY"
 * node scripts/server.js
 *
 * See https://www.npmjs.com/package/@trading-strategy-ai/web-top-node
 * for details.
 *
 */

// Check your SvelteKit build/handler.js file
// location based on your SvelteKit installation
import { handler } from '../build/handler.js';
import express from 'express';
import { Tracker, TrackerServer, createTrackerMiddleware } from '@trading-strategy-ai/web-top-node';

// Create Express server
// Polka does not work https://github.com/sveltejs/kit/issues/6363
const app = express();

// Create HTTP request tracker.
// This will store active and completed HTTP requests
// in Node.js process memory.
const tracker = new Tracker();

// Install HTTP request start/end hooks.
// If no max completed request buffer size is not given,
// read the max number from TOP_MAX_COMPLETED_TASKS
// environment variable, or default to 256 requests
// if not set.
const trackerMiddleware = createTrackerMiddleware(tracker);
app.use(trackerMiddleware);

// Install API endpoint.
// If no API key is given read one from
// TOP_WEB_API_KEY environment variable.
const trackerServer = new TrackerServer(tracker);

// Under which path we install the tracker API endpoint
const trackerPath = "/tracker";
app.get(trackerPath, trackerServer.serve.bind(trackerServer))

// Install SvelteKit server-side renderer
app.use(handler);

// Start web server
app.listen(3000, () => {
  console.log('Listening on port 3000');
  console.log(`HTTP active requests API at ${trackerPath}, API key starts as ${trackerServer.apiKey.slice(0, 4)}…`);
});
