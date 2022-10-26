import { expect, test } from '@playwright/test';

test.describe('blockchain index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/blockchains');
	});

	test('tiles should include exchange count', async ({ page }) => {
		const blockchains = page.getByTestId('blockchain-tile');
		const count = await blockchains.count();

		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			await expect(blockchains.nth(i)).toHaveText(/[\d,]+ exchanges/);
		}
	});

	test('chain tile should link to chain details', async ({ page }) => {
		const chain = page.locator('[data-testid=blockchain-tile]:has-text("Ethereum")');
		await chain.getByRole('link').click();
		await expect(page).toHaveURL(/ethereum/);
	});
});
