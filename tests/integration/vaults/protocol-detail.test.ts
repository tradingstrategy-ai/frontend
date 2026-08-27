import { expect, test } from '@playwright/test';

async function openFilters(page: import('@playwright/test').Page) {
	const filters = page.getByTestId('vault-filters');
	if (!(await filters.isVisible())) {
		await page.getByRole('button', { name: 'Filters' }).click();
	}
}

test.describe('vault protocol detail pages', () => {
	test('shows GMX AMM pools by default and identifies an AMM vault as a pool', async ({ page }) => {
		await page.goto('/vaults/protocols/gmx');

		const gmxPoolRows = page.locator('tbody tr.targetable').filter({ hasText: 'GMX USDC pool' });
		await expect(gmxPoolRows).toHaveCount(1);
		await openFilters(page);
		await expect(page.getByLabel('AMM', { exact: true })).not.toBeChecked();

		await page.goto('/vaults/gmx-usdc-pool');

		await expect(page.getByText('About the pool', { exact: true })).toBeVisible();
		await expect(page.getByText('This pool is running on GMX:', { exact: true })).toBeVisible();
		await expect(page.getByText('Pool name', { exact: true })).toBeVisible();
	});

	test('sorts ApeX vaults by TVL by default', async ({ page }) => {
		await page.goto('/vaults/protocols/apex');

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(2);
		await expect(rows.first()).toContainText('ApeX high TVL vault');
		await expect(rows.nth(1)).toContainText('ApeX high return vault');
		await expect(page.locator('thead th.tvl svg')).toBeVisible();
	});
});
