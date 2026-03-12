import { expect, test } from '@playwright/test';

test.describe('/top-vaults/chart-data', () => {
	test('should return JSON vault data', async ({ request }) => {
		const response = await request.get('/top-vaults/chart-data');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('application/json');
		expect(response.headers()['cache-control']).toBe('public, max-age=7200');

		const data = await response.json();
		expect(data.vaults).toBeInstanceOf(Array);
		expect(data.vaults.length).toBeGreaterThan(0);

		// Verify slim vault shape (12 fields only)
		const vault = data.vaults[0];
		const expectedKeys = [
			'id',
			'name',
			'vault_slug',
			'protocol_slug',
			'protocol',
			'chain',
			'chain_id',
			'current_nav',
			'one_month_cagr',
			'one_month_cagr_net',
			'risk_numeric',
			'stablecoinish'
		];
		for (const key of expectedKeys) {
			expect(vault).toHaveProperty(key);
		}
		// Ensure full vault fields are stripped
		expect(vault).not.toHaveProperty('period_results');
		expect(vault).not.toHaveProperty('description');
		expect(vault).not.toHaveProperty('address');
	});

	test('should serve Brotli-compressed response when accepted', async ({ request }) => {
		const response = await request.get('/top-vaults/chart-data', {
			headers: { 'accept-encoding': 'br' }
		});
		expect(response.status()).toBe(200);
		expect(response.headers()['content-encoding']).toBe('br');
		expect(response.headers()['vary']).toBe('Accept-Encoding');

		// Playwright auto-decompresses; verify we still get valid JSON
		const data = await response.json();
		expect(data.vaults).toBeInstanceOf(Array);
		expect(data.vaults.length).toBeGreaterThan(0);
	});

	test('should serve uncompressed response when Brotli not accepted', async ({ request }) => {
		const response = await request.get('/top-vaults/chart-data', {
			headers: { 'accept-encoding': 'identity' }
		});
		expect(response.status()).toBe(200);
		expect(response.headers()['content-encoding']).toBeUndefined();

		const data = await response.json();
		expect(data.vaults).toBeInstanceOf(Array);
		expect(data.vaults.length).toBeGreaterThan(0);
	});
});
