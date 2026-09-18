import { expect, test } from '@playwright/test';

test.describe('vault yield / risk scatter plot page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/vaults/yield-risk');
	});

	test('renders the scatter plot chart', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('scatter plot');

		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();
		await expect(plotWrapper.getByTestId('chart-watermark')).toBeVisible();

		// Wait for Plotly to render (adds .js-plotly-plot class to the chart div)
		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		// risk levels appear in the legend
		const legend = plotWrapper.locator('.legend');
		await expect(legend).toBeVisible();
		const legendText = await legend.textContent();
		expect(legendText).toContain('Negligible');
		expect(legendText).toContain('Minimal');
		expect(legendText).toContain('Low');
	});

	test('keeps Plotly legend interaction working with the watermark in place', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		await plotWrapper.locator('.legend .traces').first().click({ force: true });

		await expect
			.poll(async () =>
				plotlyChart.evaluate((node) =>
					(node as HTMLElement & { data: { visible?: boolean | string }[] }).data.map((trace) => trace.visible ?? true)
				)
			)
			.toContain('legendonly');
	});
});
