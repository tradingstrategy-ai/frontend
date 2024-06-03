import { expect, test } from '@playwright/test';

test.describe('exchange details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/ethereum/uniswap-v2');
	});

	test('should include exchange summary info', async ({ page }) => {
		const exchangeInfo = page.getByTestId('exchange-info');
		await expect(exchangeInfo).toHaveText(/Name Uniswap/i);
		await expect(exchangeInfo).toHaveText(/Volume 30d \$[\d.,]+B/);
		await expect(exchangeInfo).toHaveText(/Volume all-time \$[\d.,]+B/);
		await expect(exchangeInfo).toHaveText(/Trading pairs [\d,]/);
		await expect(exchangeInfo).toHaveText(/Tracked trading pairs [\d,]/);
	});

	test('should include trading pairs table with data', async ({ page }) => {
		const selector = '[data-testid="pairs-table"] :not(.loading) tbody tr';
		// wait for datatables to load data (client-side)
		await page.waitForSelector(selector);
		const rows = page.locator(selector);
		expect(await rows.count()).toBeGreaterThanOrEqual(10);
	});

	test('trading pairs table should include pagination', async ({ page }) => {
		const selector = '[data-testid="pairs-table"] tfoot button';
		// wait for datatables to load data (client-side)
		await page.waitForSelector(selector);
	});
});
