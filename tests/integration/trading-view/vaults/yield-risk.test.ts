import { expect, test } from '@playwright/test';

test.describe('vault yield / risk scatter plot page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/yield-risk');
	});

	test('renders the scatter plot chart', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();

		// Wait for Plotly to render (adds .js-plotly-plot class to the chart div)
		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });
	});

	test('displays risk level legend entries', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');

		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		// Verify risk levels appear in the legend
		const legend = plotWrapper.locator('.legend');
		await expect(legend).toBeVisible();

		const legendText = await legend.textContent();
		expect(legendText).toContain('Negligible');
		expect(legendText).toContain('Minimal');
		expect(legendText).toContain('Low');
	});

	test('has vault listings navigation with active Yield / Risk link', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		await expect(nav).toBeVisible();

		const activeLink = nav.locator('a.active');
		await expect(activeLink).toHaveText('Yield / Risk');
	});

	test('displays page title and hero banner', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('scatter plot');
	});
});
