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

// Install SvelteKit server-side renderer
app.use(handler);

// Start web server
app.listen(3000, () => {
	console.log('Listening on port 3000');
});
