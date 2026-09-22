import { defineMock } from 'vite-plugin-mock-dev-server';

/**
 * Test API key accepted by mock vault-api file endpoints.
 * Must match the constant used in datasets integration tests.
 */
export const VALID_API_KEY = 'test-valid-api-key-12345';

function isAuthorised(req: { headers: Record<string, string | string[] | undefined> }): boolean {
	const raw = req.headers['authorization'];
	const token = Array.isArray(raw) ? raw[0] : raw;
	return token === `Bearer ${VALID_API_KEY}`;
}

export default defineMock([
	/**
	 * Key validation endpoint — called client-side by the API key form.
	 * Returns 200 for the test key, 401 for anything else.
	 */
	{
		url: '/api/files',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				res.statusCode = 200;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ files: [] }));
			} else {
				res.statusCode = 401;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Unauthorized' }));
			}
		}
	},

	/**
	 * Vault metadata download — proxied server-side by the download endpoint.
	 */
	{
		url: '/api/files/top_vaults_by_chain.json',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				const body = JSON.stringify({ vaults: [], generated_at: new Date().toISOString() });
				res.statusCode = 200;
				res.setHeader('content-type', 'application/json');
				res.setHeader('content-length', String(Buffer.byteLength(body)));
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	},

	/**
	 * Vault prices parquet download — proxied server-side by the download endpoint.
	 */
	{
		url: '/api/files/cleaned-vault-prices-1h.parquet',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				const body = Buffer.from('PAR1mock');
				res.statusCode = 200;
				res.setHeader('content-type', 'application/octet-stream');
				res.setHeader('content-length', String(body.byteLength));
				res.setHeader('etag', '"prices-etag-v1"');
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	},

	/**
	 * HyperCore readiness manifest — proxied server-side by the download endpoint.
	 */
	{
		url: '/api/files/vault-scan-manifest.json',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				const body = JSON.stringify({
					schema_version: 1,
					published_at: '2026-09-22T03:20:00Z',
					price_file: { key: 'cleaned-vault-prices-1h.parquet', etag: 'prices-etag-v1' },
					chains: {
						'9999': {
							name: 'Hypercore',
							last_successful_price_scan_ended_at: '2026-09-22T02:55:00Z',
							last_candle_at: '2026-09-22T00:30:00Z'
						}
					}
				});
				res.statusCode = 200;
				res.setHeader('content-type', 'application/json');
				res.setHeader('content-length', String(Buffer.byteLength(body)));
				res.setHeader('cache-control', 'no-store');
				res.setHeader('etag', '"manifest-etag-v1"');
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	},

	/**
	 * Crypto cleaned prices download — proxied server-side by the download endpoint.
	 */
	{
		url: '/api/files/crypto-cleaned-vault-prices-1d.parquet',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				const body = Buffer.from('PAR1crypto-prices');
				res.statusCode = 200;
				res.setHeader('content-type', 'application/vnd.apache.parquet');
				res.setHeader('content-length', String(body.byteLength));
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	},

	/**
	 * Crypto vault metadata download — proxied server-side by the download endpoint.
	 */
	{
		url: '/api/files/crypto-vault-metadata.json',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				const body = JSON.stringify({ vaults: [], generated_at: new Date().toISOString() });
				res.statusCode = 200;
				res.setHeader('content-type', 'application/json');
				res.setHeader('content-length', String(Buffer.byteLength(body)));
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	},

	/**
	 * Exchange rates download — proxied server-side by the download endpoint.
	 */
	{
		url: '/api/files/exchange-rates.parquet',
		method: 'GET',
		response(req, res) {
			if (isAuthorised(req)) {
				const body = Buffer.from('PAR1exchange-rates');
				res.statusCode = 200;
				res.setHeader('content-type', 'application/vnd.apache.parquet');
				res.setHeader('content-length', String(body.byteLength));
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	}
]);
