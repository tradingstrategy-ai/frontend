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
				res.end(body);
			} else {
				res.statusCode = 403;
				res.setHeader('content-type', 'application/json');
				res.end(JSON.stringify({ error: 'Forbidden' }));
			}
		}
	}
]);
