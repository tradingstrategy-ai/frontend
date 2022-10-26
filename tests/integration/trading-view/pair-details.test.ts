import { expect, test } from '@playwright/test';

test.describe('trading pair details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('trading-view/ethereum/uniswap-v2/eth-usdc');
	});

	test('should include pair info', async ({ page }) => {
		const pairInfo = page.getByTestId('pair-info');
		await expect(pairInfo).toContainText('Price 0.116 USD');
		await expect(pairInfo).toContainText('Token price 0.0000870 ETH');
	});

	test('should include 2 ChartIQ chart elements', async ({ page }) => {
		const chartIQ = page.getByTestId('chartIQ');
		await expect(chartIQ.nth(0)).toBeVisible();
		await expect(chartIQ.nth(1)).toBeVisible();
	});
});
