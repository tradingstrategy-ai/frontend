import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineMock } from 'vite-plugin-mock-dev-server';

const png = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	'base64'
);

function sendSparkline(req: IncomingMessage, res: ServerResponse) {
	if (req.url?.includes('sparkline-90d-missing.png')) {
		res.statusCode = 404;
		res.end();
		return;
	}

	res.statusCode = 200;
	res.setHeader('content-type', 'image/png');
	res.setHeader('content-length', String(png.byteLength));
	res.end(png);
}

export default defineMock({
	url: '/api/top-vaults/sparklines/:filename',
	response: sendSparkline
});
