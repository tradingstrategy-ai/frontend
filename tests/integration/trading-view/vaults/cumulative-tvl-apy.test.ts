import { expect, test, type Page } from '@playwright/test';

async function expectNativeChartWatermark(page: Page, containerSelector: string) {
	await expect
		.poll(async () =>
			page.evaluate((selector) => {
				const echartsApi = window.echarts;
				const container = document.querySelector(selector);
				const graphic = container ? echartsApi?.getInstanceByDom(container)?.getOption?.().graphic : undefined;
				const elements = Array.isArray(graphic) ? (graphic[0]?.elements ?? []) : [];
				return elements.some((element) => element.id === 'chart-watermark');
			}, containerSelector)
		)
		.toBe(true);
}

test.describe('cumulative TVL/APY chart page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/cumulative-tvl-apy');
	});

	test('renders the ECharts line chart', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();

		const chart = plotWrapper.locator('.standalone-cumulative-tvl-apy-chart canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });
		await expectNativeChartWatermark(page, '.standalone-cumulative-tvl-apy-chart .chart');
	});

	test('renders APY vs cumulative TVL line chart', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');

		const chart = plotWrapper.locator('.standalone-cumulative-tvl-apy-chart canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });
	});

	test('has vault listings navigation with active Charts dropdown', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		await expect(nav).toBeVisible();

		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		await trigger.click();
		const activeLink = page.locator('[role="menu"] a.active');
		await expect(activeLink).toHaveText('Total vault earnings');
	});

	test('displays scatter plot selector with all chart links', async ({ page }) => {
		const selector = page.locator('.scatter-plot-selector');
		await expect(selector).toBeVisible();
		await expect(selector.locator('a')).toHaveCount(9);
	});

	test('page has no JavaScript errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/trading-view/vaults/cumulative-tvl-apy');

		const plotWrapper = page.getByTestId('vault-scatter-plot');
		const chart = plotWrapper.locator('.standalone-cumulative-tvl-apy-chart canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });

		expect(errors).toHaveLength(0);
	});
});
