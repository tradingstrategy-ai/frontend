import { expect, test } from '@playwright/test';

/** Must match VALID_API_KEY in tests/mocks/vault-api/files.mock.ts */
const VALID_API_KEY = 'test-valid-api-key-12345';
const INVALID_API_KEY = 'wrong-key-00000';

// ---------------------------------------------------------------------------
// Datasets page — UI & API-key flow
// ---------------------------------------------------------------------------

test.describe('vault datasets page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/datasets');
	});

	// --- Page structure ---

	test('renders with correct title', async ({ page }) => {
		await expect(page).toHaveTitle('Vault data');
	});

	test('shows dataset catalogue table with all expected columns', async ({ page }) => {
		for (const col of ['Name', 'Description', 'Format', 'Size', 'Last updated', 'Links']) {
			await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
		}
	});

	test('lists vault metadata and vault prices datasets', async ({ page }) => {
		await expect(page.getByRole('cell', { name: /Vault metadata/ })).toBeVisible();
		await expect(page.getByRole('cell', { name: /Vault prices/ })).toBeVisible();
	});

	test('shows expected filenames in dataset table', async ({ page }) => {
		await expect(page.getByText('top_vaults_by_chain.json', { exact: true })).toBeVisible();
		await expect(page.getByText('cleaned-vault-prices-1h.parquet', { exact: true })).toBeVisible();
	});

	test('shows JSON and Parquet format labels', async ({ page }) => {
		await expect(page.getByRole('cell', { name: 'JSON', exact: true })).toBeVisible();
		await expect(page.getByRole('cell', { name: 'Parquet', exact: true })).toBeVisible();
	});

	// --- API key form (unauthenticated state) ---

	test('shows API key form before a key is entered', async ({ page }) => {
		await expect(page.getByLabel('Enter API key to enable download')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Enter' })).toBeVisible();
	});

	test('download links are disabled without API key', async ({ page }) => {
		// Disabled downloads render as <span> elements, not <a>
		const disabled = page.locator('td.links span.action-link').filter({ hasText: 'Download' });
		await expect(disabled.first()).toBeVisible();
	});

	test('shows curl example with placeholder key before validation', async ({ page }) => {
		const code = page.locator('pre code');
		await expect(code).toContainText('TRADING_STRATEGY_API_KEY');
		await expect(code).toContainText('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX');
	});

	// --- API key validation ---

	test('shows error message for invalid API key', async ({ page }) => {
		await page.getByLabel('Enter API key to enable download').fill(INVALID_API_KEY);
		await page.getByRole('button', { name: 'Enter' }).click();
		await expect(page.getByText('The API key is not valid')).toBeVisible();
	});

	test('download links become active after valid API key entry', async ({ page }) => {
		await page.getByLabel('Enter API key to enable download').fill(VALID_API_KEY);
		await page.getByRole('button', { name: 'Enter' }).click();
		// Active downloads render as <a> elements
		const links = page.locator('td.links a.action-link').filter({ hasText: 'Download' });
		await expect(links.first()).toBeVisible();
	});

	test('hides API key form after successful validation', async ({ page }) => {
		await page.getByLabel('Enter API key to enable download').fill(VALID_API_KEY);
		await page.getByRole('button', { name: 'Enter' }).click();
		await expect(page.getByLabel('Enter API key to enable download')).not.toBeVisible();
	});

	test('displays validated API key in the page', async ({ page }) => {
		await page.getByLabel('Enter API key to enable download').fill(VALID_API_KEY);
		await page.getByRole('button', { name: 'Enter' }).click();
		await expect(page.getByText(VALID_API_KEY, { exact: true })).toBeVisible();
	});

	test('curl example shows actual key after successful validation', async ({ page }) => {
		await page.getByLabel('Enter API key to enable download').fill(VALID_API_KEY);
		await page.getByRole('button', { name: 'Enter' }).click();
		const code = page.locator('pre code');
		await expect(code).toContainText(VALID_API_KEY);
		await expect(code).not.toContainText('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX');
	});

	test('download links include api-key query param after validation', async ({ page }) => {
		await page.getByLabel('Enter API key to enable download').fill(VALID_API_KEY);
		await page.getByRole('button', { name: 'Enter' }).click();
		const link = page.locator('td.links a.action-link').filter({ hasText: 'Download' }).first();
		const href = await link.getAttribute('href');
		expect(href).toContain(`api-key=${VALID_API_KEY}`);
	});
});

// ---------------------------------------------------------------------------
// Download endpoint — direct API tests (no page load required)
// ---------------------------------------------------------------------------

test.describe('vault dataset download endpoint', () => {
	test('returns 401 when api-key query param is missing', async ({ request }) => {
		const res = await request.get('/trading-view/vaults/datasets/download/vault-metadata');
		expect(res.status()).toBe(401);
	});

	test('returns 404 for an unknown dataset id', async ({ request }) => {
		const res = await request.get('/trading-view/vaults/datasets/download/does-not-exist?api-key=any');
		expect(res.status()).toBe(404);
	});

	test('returns 403 when api-key is invalid', async ({ request }) => {
		const res = await request.get(`/trading-view/vaults/datasets/download/vault-metadata?api-key=${INVALID_API_KEY}`);
		expect(res.status()).toBe(403);
	});

	test('returns vault-metadata JSON with correct headers for valid key', async ({ request }) => {
		const res = await request.get(`/trading-view/vaults/datasets/download/vault-metadata?api-key=${VALID_API_KEY}`);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('application/json');
		expect(res.headers()['content-disposition']).toContain('top_vaults_by_chain.json');
		expect(res.headers()['cache-control']).toBe('private, no-store');
	});

	test('returns vault-prices parquet with correct headers for valid key', async ({ request }) => {
		const res = await request.get(`/trading-view/vaults/datasets/download/vault-prices?api-key=${VALID_API_KEY}`);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toBe('application/octet-stream');
		expect(res.headers()['content-disposition']).toContain('cleaned-vault-prices-1h.parquet');
		expect(res.headers()['cache-control']).toBe('private, no-store');
	});

	test('proxies content-length from upstream in download response', async ({ request }) => {
		const res = await request.get(`/trading-view/vaults/datasets/download/vault-metadata?api-key=${VALID_API_KEY}`);
		expect(res.status()).toBe(200);
		const length = res.headers()['content-length'];
		expect(Number(length)).toBeGreaterThan(0);
	});

	test('download response body is non-empty for vault-metadata', async ({ request }) => {
		const res = await request.get(`/trading-view/vaults/datasets/download/vault-metadata?api-key=${VALID_API_KEY}`);
		const body = await res.json();
		expect(body).toHaveProperty('vaults');
	});
});
