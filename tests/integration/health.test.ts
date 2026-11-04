import { expect, test } from '@playwright/test';

test.describe('health endpoint', () => {
	test('reports threadpool probes and is never cached', async ({ request }) => {
		const response = await request.get('/health');

		expect(response.status()).toBe(200);
		expect(response.headers()['cache-control']).toBe('no-store');

		const body = await response.json();
		expect(body.status).toBe('ok');
		expect(body.checks.dns.ok).toBe(true);
		expect(body.checks.fs.ok).toBe(true);
		expect(typeof body.checks.fs.ms).toBe('number');
	});
});
