import { expect, test } from '@playwright/test';

test.describe('vault protocol detail pages', () => {
	test('sorts ApeX vaults by TVL by default', async ({ page }) => {
		await page.goto('/vaults/protocols/apex');

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(2);
		await expect(rows.first()).toContainText('ApeX high TVL vault');
		await expect(rows.nth(1)).toContainText('ApeX high return vault');
		await expect(page.locator('thead th.tvl svg')).toBeVisible();
	});
});
