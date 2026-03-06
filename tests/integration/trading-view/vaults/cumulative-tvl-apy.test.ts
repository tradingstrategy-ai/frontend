import { expect, test } from '@playwright/test';

test.describe('cumulative TVL/APY chart page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/cumulative-tvl-apy');
	});

	test('renders the Plotly line chart', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();

		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });
	});

	test('renders APY vs cumulative TVL line chart', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');

		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		// Chart should have scatter trace with line
		const traces = plotlyChart.locator('.scatter');
		await expect(traces.first()).toBeVisible();
	});

	test('has vault listings navigation with active Charts dropdown', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		await expect(nav).toBeVisible();

		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		await trigger.click();
		const activeLink = page.locator('[role="menu"] a.active');
		await expect(activeLink).toHaveText('Cumulative TVL / APY');
	});

	test('displays scatter plot selector with all chart links', async ({ page }) => {
		const selector = page.locator('.scatter-plot-selector');
		await expect(selector).toBeVisible();
		await expect(selector.locator('a')).toHaveCount(5);
	});

	test('page has no JavaScript errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/trading-view/vaults/cumulative-tvl-apy');

		const plotWrapper = page.getByTestId('vault-scatter-plot');
		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		expect(errors).toHaveLength(0);
	});
});
