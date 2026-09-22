import { expect, test } from '@playwright/test';
import { waitForHydration } from '../helpers';

/** Must match VALID_API_KEY in tests/mocks/vault-api/files.mock.ts */
const VALID_API_KEY = 'test-valid-api-key-12345';
const INVALID_API_KEY = 'wrong-key-00000';

async function submitApiKey(page: import('@playwright/test').Page, key: string, expectedStatus: number) {
	await waitForHydration(page);
	await page.getByLabel('Enter API key to enable download').fill(key);
	const responsePromise = page.waitForResponse((response) => {
		const url = new URL(response.url());
		return url.pathname === '/api/files' && response.request().method() === 'GET';
	});
	await page.getByRole('button', { name: 'Enter' }).click();
	expect((await responsePromise).status()).toBe(expectedStatus);
}

// ---------------------------------------------------------------------------
// Datasets page — UI & API-key flow
// ---------------------------------------------------------------------------

test.describe('vault datasets page', () => {
	test('lists the dataset catalogue and the unauthenticated download state', async ({ page }) => {
		await page.goto('/vaults/datasets');

		await expect(page).toHaveTitle('Vault datasets | Trading Strategy');
		await expect(page.getByRole('link', { name: 'file and data description here' })).toHaveAttribute(
			'href',
			'https://tradingstrategy.ai/docs/overview/defi-vault-data.html'
		);

		for (const col of ['Plan', 'Name', 'Description', 'Format', 'Size', 'Last updated', 'Links']) {
			await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
		}

		for (const name of [
			'Vault metadata',
			'Vault prices',
			'Crypto cleaned prices',
			'Crypto metadata',
			'Exchange rates',
			'Vault metadata (sample)',
			'Vault prices (sample)'
		]) {
			await expect(page.getByText(name, { exact: true })).toBeVisible();
		}

		await expect(page.locator('td.plan .data-badge.success').first()).toHaveText('Free');
		await expect(page.locator('td.plan .data-badge.warning').first()).toHaveText('Pro');

		for (const filename of [
			'vault-metadata.json',
			'vault-historical.parquet',
			'crypto-cleaned-vault-prices-1d.parquet',
			'crypto-vault-metadata.json',
			'exchange-rates.parquet'
		]) {
			await expect(page.getByText(filename, { exact: true })).toBeVisible();
		}
		await expect(page.getByRole('cell', { name: 'JSON', exact: true }).first()).toBeVisible();
		await expect(page.getByRole('cell', { name: 'Parquet', exact: true }).first()).toBeVisible();

		// no purchase message on a plain visit
		await expect(page.getByText('Thank you for your purchase')).toHaveCount(0);

		// API key form before a key is entered; disabled downloads render as <span> elements, not <a>
		await expect(page.getByLabel('Enter API key to enable download')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Enter' })).toBeVisible();
		await expect(page.locator('td.links span.action-link').filter({ hasText: 'Download' }).first()).toBeVisible();

		const code = page.locator('pre code');
		await expect(code).toContainText('TRADING_STRATEGY_API_KEY');
		await expect(code).toContainText('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX');
	});

	test('shows "check your email" message after Creem checkout redirect', async ({ page }) => {
		const response = await page.goto('/vaults/datasets?checkout_id=ch_test123&product_id=prod_test&signature=deadbeef');
		expect(response?.headers()['cache-control']).toBe('no-store');
		await expect(page.getByText('Thank you for your purchase')).toBeVisible();
		await expect(page.getByText('Check your email for your API key')).toBeVisible();
		await expect(page.getByLabel('Enter API key to enable download')).toBeVisible();
	});

	test('shows error message for invalid API key', async ({ page }) => {
		await page.goto('/vaults/datasets');
		await submitApiKey(page, INVALID_API_KEY, 401);
		await expect(page.getByText('The API key is not valid')).toBeVisible();
	});

	test('enables downloads after valid API key entry', async ({ page }) => {
		await page.goto('/vaults/datasets');
		await submitApiKey(page, VALID_API_KEY, 200);

		// active downloads render as <a> elements
		await expect(page.locator('td.links a.action-link').filter({ hasText: 'Download' }).first()).toBeVisible();
		await expect(page.getByLabel('Enter API key to enable download')).not.toBeVisible();
		await expect(page.getByText(VALID_API_KEY, { exact: true })).toBeVisible();

		const code = page.locator('pre code');
		await expect(code).toContainText(VALID_API_KEY);
		await expect(code).not.toContainText('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX');

		// target a paid (gated) download link — free sample links use /api and carry no key
		const link = page.locator('td.links a.action-link[href*="/datasets/download/"]').first();
		expect(await link.getAttribute('href')).toContain(`api-key=${VALID_API_KEY}`);
	});
});

// ---------------------------------------------------------------------------
// Download endpoint — direct API tests (no page load required)
// ---------------------------------------------------------------------------

test.describe('vault dataset download endpoint', () => {
	test('returns 401 when api-key query param is missing', async ({ request }) => {
		const res = await request.get('/vaults/datasets/download/vault-metadata');
		expect(res.status()).toBe(401);
	});

	test('returns 404 for an unknown dataset id', async ({ request }) => {
		const res = await request.get('/vaults/datasets/download/does-not-exist?api-key=any');
		expect(res.status()).toBe(404);
	});

	test('returns 403 when api-key is invalid', async ({ request }) => {
		const res = await request.get(`/vaults/datasets/download/vault-metadata?api-key=${INVALID_API_KEY}`);
		expect(res.status()).toBe(403);
	});

	test('returns vault-metadata JSON with correct headers and body for valid key', async ({ request }) => {
		const res = await request.get(`/vaults/datasets/download/vault-metadata?api-key=${VALID_API_KEY}`);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('application/json');
		expect(res.headers()['content-disposition']).toContain('vault-metadata.json');
		expect(res.headers()['cache-control']).toBe('private, no-store');
		// content-length is proxied from upstream
		expect(Number(res.headers()['content-length'])).toBeGreaterThan(0);
		expect(await res.json()).toHaveProperty('vaults');
	});

	test('returns vault-prices parquet with correct headers for valid key', async ({ request }) => {
		const res = await request.get(`/vaults/datasets/download/vault-prices?api-key=${VALID_API_KEY}`);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toBe('application/octet-stream');
		expect(res.headers()['content-disposition']).toContain('vault-historical.parquet');
		expect(res.headers()['cache-control']).toBe('private, no-store');
		expect(res.headers()['etag']).toBe('"prices-etag-v1"');
	});

	test('returns the uncached manifest with its own ETag and the price ETag in its body', async ({ request }) => {
		const res = await request.get(`/vaults/datasets/download/vault-scan-manifest?api-key=${VALID_API_KEY}`);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('application/json');
		expect(res.headers()['cache-control']).toBe('private, no-store');
		expect(res.headers()['etag']).toBe('"manifest-etag-v1"');
		expect(await res.json()).toMatchObject({
			schema_version: 1,
			price_file: { etag: 'prices-etag-v1' },
			chains: { '9999': { last_candle_at: '2026-09-22T00:30:00Z' } }
		});
	});

	for (const dataset of [
		{
			id: 'crypto-cleaned-prices',
			contentType: 'application/vnd.apache.parquet',
			filename: 'crypto-cleaned-vault-prices-1d.parquet'
		},
		{ id: 'crypto-metadata', contentType: 'application/json', filename: 'crypto-vault-metadata.json' },
		{
			id: 'exchange-rates',
			contentType: 'application/vnd.apache.parquet',
			filename: 'exchange-rates.parquet'
		}
	]) {
		test(`returns ${dataset.id} with correct headers for valid key`, async ({ request }) => {
			const res = await request.get(`/vaults/datasets/download/${dataset.id}?api-key=${VALID_API_KEY}`);
			expect(res.status()).toBe(200);
			expect(res.headers()['content-type']).toBe(dataset.contentType);
			expect(res.headers()['content-disposition']).toContain(dataset.filename);
			expect(res.headers()['cache-control']).toBe('private, no-store');
		});
	}
});
