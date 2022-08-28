/**
 * Polka based SvelteKit server-side renderer
 * with web-top HTTP request tracking API installed.
 */

// Check your SvelteKit build/handler.js file
// location based on your SvelteKit installation
import { handler } from '../build/handler.js';
import polka from 'polka';
import { Tracker } from '@trading-strategy-ai/web-top-node';

// Create Polka server
// See https://github.com/lukeed/polka
// for more information.
// (Polka is the default for SvelteKit)
const app = polka();

// Create HTTP request tracking middleware
const tracker = new Tracker();
const trackerMiddleware = createTrackerMiddleware(tracker);
const trackerServer = new TrackerServer(tracker, apiKey);

// Install HTTP request start/end hooks.
// If no max completed request buffer size is not given,
// read the max number from TOP_MAX_COMPLETED_TASKS
// environment variable, or default to 256 requests
// if not set.
app.use(trackerMiddleware);

// Install API endpoint.
// If no API key is given read one from
// TOP_WEB_API_KEY environment variable.
const trackerPath = "/tracker";
app.get(trackerPath, trackerServer.serve.bind(trackerServer))

// Install SvelteKit server-side renderer
app.use(handler);

app.listen(3000, () => {
  console.log('Listening on port 3000');
  console.log(`HTTP active requests API at ${trackerPath}, API key starts as ${tracker.apiKey.slice(0, 4)}…`);
});
