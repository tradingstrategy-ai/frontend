import { expect, test } from '@playwright/test';

async function openFilters(page: import('@playwright/test').Page) {
	const filters = page.getByTestId('vault-filters');
	if (!(await filters.evaluate((details: HTMLDetailsElement) => details.open))) {
		await page.getByTestId('filters-summary').click();
	}
	await expect(filters).toHaveJSProperty('open', true);
	await expect(page.locator('.filters-content')).toBeVisible();
}

test.describe('vault protocol detail pages', () => {
	test('redirects legacy unknown-protocol slugs to the canonical group', async ({ page }) => {
		await page.goto('/vaults/protocols/protocol-not-yet-identified?sort=tvl');

		await expect(page).toHaveURL('/vaults/protocols/unknown?sort=tvl');
		await expect(page).toHaveTitle('Vaults with unidentified protocols');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vaults with unidentified protocols');
		await expect(page.getByText('No chart data available.')).not.toBeVisible();
	});

	test('shows GMX AMM pools by default and identifies an AMM vault as a pool', async ({ page }) => {
		await page.goto('/vaults/protocols/gmx');

		await expect(page).toHaveTitle('GMX pools and yields');
		await expect(page.getByRole('heading', { name: 'GMX powered pools', level: 1 })).toBeVisible();
		const gmxPoolRows = page.locator('tbody tr.targetable').filter({ hasText: 'GMX USDC pool' });
		await expect(gmxPoolRows).toHaveCount(1);
		await openFilters(page);
		await expect(page.getByLabel('AMM', { exact: true })).not.toBeChecked();

		await page.goto('/vaults/gmx-usdc-pool');

		await expect(page).toHaveTitle('GMX USDC pool | DeFi pool | Trading Strategy');
		await expect(page.getByText('About the pool', { exact: true })).toBeVisible();
		await expect(page.getByText('This pool is running on GMX:', { exact: true })).toBeVisible();
		await expect(page.getByText('Pool name', { exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'View all GMX pools' })).toBeVisible();
	});

	test('sorts ApeX vaults by TVL by default', async ({ page }) => {
		await page.goto('/vaults/protocols/apex');

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(125, { timeout: 15_000 });
		await expect(rows.first()).toContainText('ApeX high TVL vault');
		await expect(rows.nth(124)).toContainText('ApeX pagination vault 123');

		await expect
			.poll(async () => {
				await page.evaluate(() => document.querySelector('[data-testid="load-more-sentinel"]')?.scrollIntoView());
				return rows.count();
			})
			.toBe(130);
		await expect(rows.last()).toContainText('ApeX high return vault');
	});
});
