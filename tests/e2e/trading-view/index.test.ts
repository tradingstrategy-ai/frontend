import { expect, test } from '@playwright/test';

test.describe('trading data overview', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view');
	});

	test('should include blockchain count in blockchain tile', async ({ page }) => {
		const blockchains = page.getByText(/Currently tracking data across \d+ blockchains/);
		await expect(blockchains).toBeVisible();
	});

	test('should include vault count in vaults tile if data is available', async ({ page }) => {
		const vaults = page.getByText(/Currently displaying [\d,]+ vaults/);
		// Vault data requires private credentials — skip assertion if not loaded
		if ((await vaults.count()) > 0) {
			await expect(vaults).toBeVisible();
		}
	});

	test('should include database size in backtesting tile', async ({ page }) => {
		const database = page.getByText(/Currently providing [\d.,]+ TB of data/);
		await expect(database).toBeVisible();
	});
});
