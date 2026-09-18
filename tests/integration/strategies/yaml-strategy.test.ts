import { expect, test } from '@playwright/test';

const BASE = '/strategies/trading-strategy-ichiv3-ls-2';

test.describe('YAML-configured strategy', () => {
	test('should appear in the strategies listing with vault metrics in the tile', async ({ page }) => {
		await page.goto('/strategies');

		await expect(page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' })).toBeVisible();

		const tile = page.locator('[data-testid="strategy-tiles"]').filter({ hasText: 'ICHI v3 Liquidity Strategy' });
		await expect(tile).toBeVisible();
		await expect(tile).toContainText('Annual return');
		await expect(tile).toContainText('TVL');
		await expect(tile).toContainText('Age');
		await expect(tile).toContainText('Sharpe');
	});

	test('should render the overview page with vault metrics, navigation and freshness debug data', async ({ page }) => {
		const response = await page.goto(BASE);
		expect(response?.status()).toBe(200);

		await expect(page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' })).toBeVisible();
		await expect(page.getByText('Total value locked')).toBeVisible();
		await expect(page.getByText('$500')).toBeVisible();
		await expect(page.getByText('Annual return')).toBeVisible();

		const menu = page.locator('nav.strategy-nav .menu-wrapper');
		for (const label of ['Overview', 'Performance', 'Description', 'Vault info', 'Fees']) {
			await expect(menu.getByText(label)).toBeVisible();
		}

		const debugData = page.locator('[data-debug-freshness="yaml-strategy:trading-strategy-ichiv3-ls-2"]');
		await expect(debugData).toHaveCount(1);
		await expect(debugData).toContainText('topVaultsFeed');
		await expect(debugData).toContainText('vaultChart');
	});

	test('should render the performance page with period metrics table', async ({ page }) => {
		const response = await page.goto(`${BASE}/performance`);
		expect(response?.status()).toBe(200);

		await expect(page.getByText('Returns and period details')).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Month', exact: true })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: '3 months' })).toBeVisible();
		const periodicMetrics = page.locator('.periodic-metrics');
		await periodicMetrics.getByRole('button', { name: 'View all' }).click();
		const periodTable = periodicMetrics.locator('.period-table');
		await expect(periodTable).toContainText('Period data availability');
		await expect(periodTable).toContainText('30 days');
		await expect(periodTable).toContainText('90 days');
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
