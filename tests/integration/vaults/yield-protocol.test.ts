import { expect, test } from '@playwright/test';

test.describe('vault yield / protocol scatter plot page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/vaults/yield-protocol');
	});

	test('renders the scatter plot chart', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('scatter plot');

		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();
		await expect(plotWrapper.getByTestId('chart-watermark')).toBeVisible();

		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		// legend should contain at least one protocol name (mock data may not produce "Other")
		const legend = plotWrapper.locator('.legend');
		await expect(legend).toBeVisible();
		expect((await legend.textContent())?.length).toBeGreaterThan(0);

		// in-page "See charts" link row (ScatterPlotSelector), distinct from the Charts nav dropdown
		const selector = page.locator('.scatter-plot-selector');
		await expect(selector).toBeVisible();
		await expect(selector.locator('a')).toHaveCount(11);
	});
});
