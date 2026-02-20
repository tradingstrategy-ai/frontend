import { expect, test } from '@playwright/test';

test.describe('vault current/peak TVL scatter plot page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/current-peak-tvl');
	});

	test('renders scatter plot of current vs peak TVL with navigation', async ({ page }) => {
		// Page title
		await expect(page.locator('h1')).toContainText('scatter plot');

		// Vault listings navigation with active Charts dropdown
		const nav = page.locator('.vault-listings-selector');
		await expect(nav).toBeVisible();
		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		// Scatter plot selector links (risk, protocol, chain, current/peak TVL)
		const selector = page.locator('.scatter-plot-selector');
		await expect(selector).toBeVisible();
		await expect(selector.locator('a')).toHaveCount(4);

		// Chart renders with Plotly
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();
		const plotlyChart = plotWrapper.locator('.js-plotly-plot');
		await expect(plotlyChart).toBeVisible({ timeout: 15000 });

		// Legend is present with chain entries
		const legend = plotWrapper.locator('.legend');
		await expect(legend).toBeVisible();
		const legendText = await legend.textContent();
		expect(legendText?.length).toBeGreaterThan(0);
	});
});
