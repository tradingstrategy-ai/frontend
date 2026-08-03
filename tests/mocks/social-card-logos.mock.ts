import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineMock } from 'vite-plugin-mock-dev-server';

// A valid 1×1 PNG is sufficient for exercising the local metadata-logo proxy.
const png = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	'base64'
);

function sendPng(_req: IncomingMessage, res: ServerResponse) {
	res.statusCode = 200;
	res.setHeader('content-type', 'image/png');
	res.setHeader('content-length', String(png.byteLength));
	res.end(png);
}

export default defineMock([
	{ url: '/api/curators/:slug/light.png', response: sendPng },
	{ url: '/api/vault-protocols/:slug/light.png', response: sendPng },
	{ url: '/api/stablecoin-metadata/:slug/light.png', response: sendPng }
]);
