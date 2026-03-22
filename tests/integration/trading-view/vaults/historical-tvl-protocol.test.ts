import { expect, test, type Page } from '@playwright/test';

async function expectNativeHistoricalWatermark(page: Page) {
	await expect
		.poll(async () =>
			page.evaluate(() => {
				const echartsApi = window.echarts;
				const container = document.querySelector('.chart-canvas');
				const graphic = container ? echartsApi?.getInstanceByDom(container)?.getOption?.().graphic : undefined;
				const elements = Array.isArray(graphic) ? (graphic[0]?.elements ?? []) : [];
				return elements.some((element) => element.id === 'chart-watermark');
			})
		)
		.toBe(true);
}

test.describe('historical vault TVL by vault protocol chart data endpoint', () => {
	test('returns cached JSON payload with aligned series data', async ({ request }) => {
		const response = await request.get('/trading-view/vaults/historical-tvl-protocol/chart-data');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('application/json');
		expect(response.headers()['cache-control']).toBe('public, max-age=86400');

		const data = await response.json();
		expect(data.generatedAt).toEqual(expect.any(String));
		expect(data.durationMs).toEqual(expect.any(Number));
		expect(data.cacheTtlSeconds).toBe(86400);
		expect(data.weeks.length).toBeGreaterThan(0);
		expect(data.series.length).toBeGreaterThan(0);
		expect(data.meta.excludedBlacklistedVaults).toBeGreaterThanOrEqual(1);

		for (const series of data.series) {
			expect(series.key).toEqual(expect.any(String));
			expect(series.label).toEqual(expect.any(String));
			expect(series.protocolSlug).toEqual(expect.any(String));
			expect(series.values).toHaveLength(data.weeks.length);
		}
	});
});

test.describe('historical vault TVL by vault protocol page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/historical-tvl-protocol');
	});

	test('renders the ECharts chart canvas', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();
		await expect(plotWrapper.locator('.chart-canvas canvas')).toBeVisible({ timeout: 15000 });
		await expectNativeHistoricalWatermark(page);
	});

	test('has vault listings navigation with active Charts dropdown', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		await trigger.click();
		await expect(page.locator('[role="menu"] a.active')).toHaveText('Historical TVL by vault protocol');
	});
});
