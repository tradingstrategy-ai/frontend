import { expect, test } from '@playwright/test';

test.describe('chain details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/ethereum');
	});

	test('should include chain info tiles', async ({ page }) => {
		const chainSummary = page.getByTestId('chain-summary');
		await expect(chainSummary).toHaveText(/[\d,]+ last indexed block/i);
		await expect(chainSummary).toHaveText(/[\d,]+ first indexed block/i);
		await expect(chainSummary).toHaveText(/[\d,]+ exchanges/i);
		await expect(chainSummary).toHaveText(/[\d,]+ tracked trading pairs/i);
		await expect(chainSummary).toHaveText(/[\d,]+ active trading pairs/i);
	});

	test('should include exchange table with data', async ({ page }) => {
		const selector = '[data-testid="exchanges"] tbody .col-exchange';
		// wait for datatables to load data (client-side)
		await page.waitForSelector(selector);
		const rows = page.locator(selector);
		expect(await rows.count()).toBeGreaterThanOrEqual(10);
	});

	test('should include trading pairs table with data', async ({ page }) => {
		const selector = '[data-testid="trading-pairs"] tbody .col-pair';
		// wait for datatables to load data (client-side)
		await page.waitForSelector(selector);
		const rows = page.locator(selector);
		expect(await rows.count()).toBeGreaterThanOrEqual(10);
	});
});
