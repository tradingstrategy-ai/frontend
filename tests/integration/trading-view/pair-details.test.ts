import { expect, test } from '@playwright/test';

test.describe('trading pair details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('trading-view/ethereum/uniswap-v2/eth-usdc');
	});

	test('should include pair info', async ({ page }) => {
		const pairInfo = page.getByTestId('pair-info');
		await expect(pairInfo).toContainText(/Price [\d.,]+ USD/);
		await expect(pairInfo).toContainText(/Token price [\d.,]+\s+ETH/);
	});

	test('should include TradingView chart canvas elements', async ({ page }) => {
		test.skip(!!process.env.CI, 'Skipping on CI runs for now');

		const tvChart = page.getByTestId('tv-chart');
		await expect(tvChart).toBeVisible();
		const count = await tvChart.locator('canvas').count();
		expect(count).toBeGreaterThan(0);
	});
});
