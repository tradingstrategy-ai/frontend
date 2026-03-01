import { expect, test } from '@playwright/test';

const BASE = '/strategies/trading-strategy-ichiv3-ls-2';

test.describe('YAML-configured strategy', () => {
	test('should appear in the strategies listing', async ({ page }) => {
		await page.goto('/strategies');

		const heading = page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' });
		await expect(heading).toBeVisible();
	});

	test('should display vault metrics in the strategy tile', async ({ page }) => {
		await page.goto('/strategies');

		const tile = page.locator('[data-testid="strategy-tiles"]').filter({ hasText: 'ICHI v3 Liquidity Strategy' });
		await expect(tile).toBeVisible();
		await expect(tile).toContainText('Annual return');
		await expect(tile).toContainText('TVL');
		await expect(tile).toContainText('Age');
		await expect(tile).toContainText('Sharpe');
	});

	test('should render the overview page', async ({ page }) => {
		const response = await page.goto(BASE);
		expect(response?.status()).toBe(200);

		await expect(page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' })).toBeVisible();
	});

	test('should display vault metrics on the overview page', async ({ page }) => {
		await page.goto(BASE);

		await expect(page.getByText('Total value locked')).toBeVisible();
		await expect(page.getByText('$500')).toBeVisible();
		await expect(page.getByText('Annual return')).toBeVisible();
	});

	test('should show left-side navigation with all pages', async ({ page }) => {
		await page.goto(BASE);

		const menu = page.locator('nav.strategy-nav .menu-wrapper');
		await expect(menu.getByText('Overview')).toBeVisible();
		await expect(menu.getByText('Performance')).toBeVisible();
		await expect(menu.getByText('Description')).toBeVisible();
		await expect(menu.getByText('Vault info')).toBeVisible();
		await expect(menu.getByText('Fees')).toBeVisible();
	});

	test('should render the performance page with period metrics table', async ({ page }) => {
		const response = await page.goto(`${BASE}/performance`);
		expect(response?.status()).toBe(200);

		await expect(page.getByText('Performance metrics')).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Month', exact: true })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: '3 months' })).toBeVisible();
	});

	test('should render the description page', async ({ page }) => {
		const response = await page.goto(`${BASE}/description`);
		expect(response?.status()).toBe(200);

		const content = page.locator('.strategy-description');
		await expect(content).toBeVisible();
		await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
	});

	test('should render the vault info page', async ({ page }) => {
		const response = await page.goto(`${BASE}/vault`);
		expect(response?.status()).toBe(200);

		await expect(page.getByText('Technical Details')).toBeVisible();
		await expect(page.getByText('Vault name')).toBeVisible();
		await expect(page.getByText('Vault address')).toBeVisible();
	});

	test('should render the fees page', async ({ page }) => {
		const response = await page.goto(`${BASE}/fees`);
		expect(response?.status()).toBe(200);

		await expect(page.getByRole('heading', { name: 'Fees' })).toBeVisible();
		await expect(page.getByText('Management fee', { exact: true })).toBeVisible();
		await expect(page.getByText('Performance fee', { exact: true })).toBeVisible();
	});
});
