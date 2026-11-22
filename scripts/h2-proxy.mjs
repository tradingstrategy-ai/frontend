/**
 * Local HTTP/2 (TLS) reverse proxy for page-speed A/B tests of a production build.
 *
 * adapter-node serves HTTP/1.1, where a browser opens at most six connections per origin and
 * a page's ~130 JS chunks trickle in, so hydration runs as many small tasks. Production is
 * HTTP/2 behind Cloudflare: everything arrives at once and hydration runs as one long task.
 * Build-level changes (CSS inlining, chunking) must therefore be compared over HTTP/2.
 * See docs/speed.md.
 *
 *   node --env-file=.env --env-file=.env.local scripts/server.js     # build on :3000
 *   node scripts/h2-proxy.mjs                                       # https://127.0.0.1:3443
 *   pnpm run perf:probe --base https://127.0.0.1:3443 --ignore-https-errors
 *
 * Text responses are Brotli-compressed (quality 4) like Cloudflare does; without it, HTML size
 * changes cost far more on the emulated mobile network than they do in production.
 *
 * Options: `--port 3443`, `--upstream http://127.0.0.1:3000`. A throwaway self-signed
 * certificate is generated with `openssl` into a temporary directory on start.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { createSecureServer, constants } from 'node:http2';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { constants as zlibConstants, createBrotliCompress } from 'node:zlib';

const { values: options } = parseArgs({
	args: process.argv.slice(2).filter((arg) => arg !== '--'),
	options: {
		port: { type: 'string', default: '3443' },
		upstream: { type: 'string', default: 'http://127.0.0.1:3000' }
	}
});

const upstream = new URL(options.upstream);
const certDir = mkdtempSync(join(tmpdir(), 'h2-proxy-'));
const keyPath = join(certDir, 'key.pem');
const certPath = join(certDir, 'cert.pem');
execFileSync(
	'openssl',
	[
		'req',
		'-x509',
		'-newkey',
		'ec',
		'-pkeyopt',
		'ec_paramgen_curve:prime256v1',
		'-nodes',
		'-days',
		'1',
		'-subj',
		'/CN=127.0.0.1',
		'-keyout',
		keyPath,
		'-out',
		certPath
	],
	{ stdio: 'ignore' }
);

/** HTTP/1-only headers that must not be forwarded on an HTTP/2 response. */
const CONNECTION_HEADERS = new Set(['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'proxy-connection']);

const server = createSecureServer(
	{ key: readFileSync(keyPath), cert: readFileSync(certPath), allowHTTP1: true },
	(req, res) => {
		const headers = Object.fromEntries(
			Object.entries(req.headers).filter(([name]) => !name.startsWith(':') && !CONNECTION_HEADERS.has(name))
		);
		headers.host = upstream.host;
		headers['x-forwarded-proto'] = 'https';

		const proxied = httpRequest(
			{ host: upstream.hostname, port: upstream.port, method: req.method, path: req.url, headers },
			(upstreamRes) => {
				const responseHeaders = Object.fromEntries(
					Object.entries(upstreamRes.headers).filter(([name]) => !CONNECTION_HEADERS.has(name))
				);
				const compressible =
					!upstreamRes.headers['content-encoding'] &&
					/^(text\/|application\/(json|javascript|xml))/.test(upstreamRes.headers['content-type'] ?? '') &&
					/\bbr\b/.test(String(req.headers['accept-encoding'] ?? ''));
				if (!compressible) {
					res.writeHead(upstreamRes.statusCode ?? 502, responseHeaders);
					upstreamRes.pipe(res);
					return;
				}
				delete responseHeaders['content-length'];
				responseHeaders['content-encoding'] = 'br';
				res.writeHead(upstreamRes.statusCode ?? 502, responseHeaders);
				upstreamRes.pipe(createBrotliCompress({ params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 } })).pipe(res);
			}
		);
		proxied.on('error', () => {
			if (!res.headersSent) res.writeHead(constants.HTTP_STATUS_BAD_GATEWAY);
			res.end();
		});
		req.pipe(proxied);
	}
);

server.listen(Number(options.port), '127.0.0.1', () => {
	console.log(`HTTP/2 proxy https://127.0.0.1:${options.port} → ${upstream.origin}`);
});

const shutdown = () => {
	rmSync(certDir, { recursive: true, force: true });
	process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
