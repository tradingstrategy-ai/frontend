/**
 * Wrapper service to check for malformed URIs before passing requests to
 * `node-adapter` handler.
 *
 * After running `SSR=true npm run build`, start this service with:
 * `node server.js`
 */
import { createServer } from 'http';
import { handler } from '../build/handler.js';

const port = process.env.FRONTEND_PORT || 3000;

debugger;

const server = createServer((req, res) => {
	try {
		decodeURI(req.url);
	} catch (e) {
		const invalidUriPath = `/invalid${encodeURI(req.url)}`;
		console.log(`URIError: can't decode ${req.url}; forwarding to ${invalidUriPath}`);
		req.url = invalidUriPath;
	} finally {
		handler(req, res);
	}
});

server.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});
