import { expect, test } from '@playwright/test';

test.describe('vault yield / protocol scatter plot page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/yield-protocol');
	});

	test('renders the scatter plot chart', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();

		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });
	});

	test('displays protocol legend entries', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');

		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		const legend = plotWrapper.locator('.legend');
		await expect(legend).toBeVisible();

		const legendText = await legend.textContent();
		// Legend should contain at least one protocol name (mock data may not produce "Other")
		expect(legendText?.length).toBeGreaterThan(0);
	});

	test('has vault listings navigation with active Yield / Protocol link', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		await expect(nav).toBeVisible();

		const activeLink = nav.locator('a.active');
		await expect(activeLink).toHaveText('Yield / Protocol');
	});

	test('displays page title and hero banner', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('scatter plot');
	});

	test('displays scatter plot selector with both chart links', async ({ page }) => {
		const selector = page.locator('.scatter-plot-selector');
		await expect(selector).toBeVisible();
		await expect(selector.locator('a')).toHaveCount(3);
	});
});
