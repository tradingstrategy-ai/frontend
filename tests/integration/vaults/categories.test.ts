import { expect, test } from '@playwright/test';

test.describe('vault category pages', () => {
	test('lists source categories alphabetically with their descriptions and aggregate metrics', async ({ page }) => {
		await page.goto('/vaults/categories');

		await expect(page).toHaveTitle('Vault strategy categories | Trading Strategy');
		await expect(page.getByRole('heading', { name: 'Vault categories', level: 1 })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Vaults' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Avg. APY (30d)' })).toBeVisible();

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(5);
		await expect(rows.first()).toContainText('Algorithmic trading');
		await expect(rows.first()).toContainText('Systematic strategies that use algorithmic signals');
		await expect(rows.first().getByRole('link', { name: 'DeFi markets' })).toHaveAttribute(
			'href',
			'https://example.com/markets'
		);
	});

	test('uses dash-separated category routes, shows category details, and links vault categories', async ({ page }) => {
		await page.goto('/vaults/categories/algorithmic_trading');
		await expect(page).toHaveURL('/vaults/categories/algorithmic-trading');
		await expect(page.getByRole('heading', { name: 'Algorithmic trading (1 reported vault)', level: 1 })).toBeVisible();
		await expect(page.getByText('Reported category totals:')).toBeVisible();
		await expect(page.locator('tbody tr.targetable').filter({ hasText: 'Trading Strategy ICHIv3 LS 2' })).toHaveCount(
			1
		);
		await expect(page.getByTestId('vault-group-mini-chart')).toBeVisible();

		await page.goto('/vaults/trading-strategy-ichiv3-ls-2');
		const categories = page.locator('.vault-categories');
		await expect(categories).toContainText('Categories:');
		await expect(categories.getByRole('link', { name: 'Algorithmic trading' })).toHaveAttribute(
			'href',
			'/vaults/categories/algorithmic-trading'
		);
		await expect(categories.getByRole('link', { name: 'Yield optimisation' })).toHaveAttribute(
			'href',
			'/vaults/categories/yield-optimisation'
		);
	});

	test('renders a registered zero-vault category', async ({ page }) => {
		await page.goto('/vaults/categories/zero-vault');

		await expect(page.getByRole('heading', { name: 'Zero vault (0 reported vaults)', level: 1 })).toBeVisible();
		await expect(page.getByText('Reported category totals: 0 vaults')).toBeVisible();
		await expect(page.locator('tbody tr.targetable')).toHaveCount(0);
		await expect(page.getByTestId('vault-group-mini-chart')).toHaveCount(0);
	});

	test('returns 404 for non-category source tags', async ({ page }) => {
		const response = await page.goto('/vaults/categories/constructor');
		expect(response?.status()).toBe(404);
	});

	test('keeps URL-backed alternate sorting available', async ({ page }) => {
		await page.goto('/vaults/categories?sort=tvl&direction=desc');

		await expect(page.locator('tbody tr.targetable').first()).toContainText('Directional trading');
	});

	test('returns an empty continuation for an unregistered category scope', async ({ request }) => {
		const response = await request.get('/top-vaults/listing-data?listing=category&scope=constructor');

		expect(response.status()).toBe(200);
		expect((await response.json()).vaults).toEqual([]);
	});
});
