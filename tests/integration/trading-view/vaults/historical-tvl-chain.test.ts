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

test.describe('historical vault TVL by chain chart data endpoint', () => {
	test('returns cached JSON payload with aligned series data', async ({ request }) => {
		const response = await request.get('/trading-view/vaults/historical-tvl-chain/chart-data');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('application/json');
		expect(response.headers()['cache-control']).toBe('public, max-age=86400');

		const data = await response.json();
		expect(data.generatedAt).toEqual(expect.any(String));
		expect(data.durationMs).toEqual(expect.any(Number));
		expect(data.cacheTtlSeconds).toBe(86400);
		expect(data.weeks).toBeInstanceOf(Array);
		expect(data.weeks.length).toBeGreaterThan(0);
		expect(data.weeks).toEqual([...data.weeks].sort());
		expect(data.series).toBeInstanceOf(Array);
		expect(data.series.length).toBeGreaterThan(0);
		expect(data.meta.excludedBlacklistedVaults).toBeGreaterThanOrEqual(1);

		for (const series of data.series) {
			expect(series.key).toEqual(expect.any(String));
			expect(series.label).toEqual(expect.any(String));
			expect(series.chainIds).toBeInstanceOf(Array);
			expect(series.values).toHaveLength(data.weeks.length);
		}
	});

	test('serves Brotli-compressed responses when requested', async ({ request }) => {
		const response = await request.get('/trading-view/vaults/historical-tvl-chain/chart-data', {
			headers: { 'accept-encoding': 'br' }
		});

		expect(response.status()).toBe(200);
		expect(response.headers()['content-encoding']).toBe('br');
		expect(response.headers()['vary']).toBe('Accept-Encoding');

		const data = await response.json();
		expect(data.series.length).toBeGreaterThan(0);
	});
});

test.describe('historical vault TVL by chain page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/historical-tvl-chain');
	});

	test('renders the ECharts chart canvas', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();

		const chart = plotWrapper.locator('.chart-canvas canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });
		await expectNativeHistoricalWatermark(page);
	});

	test('has vault listings navigation with active Charts dropdown', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		await expect(nav).toBeVisible();

		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		await trigger.click();
		const activeLink = page.locator('[role="menu"] a.active');
		await expect(activeLink).toHaveText('Historical TVL by chain');
	});

	test('displays scatter plot selector with all chart links', async ({ page }) => {
		const selector = page.locator('.scatter-plot-selector');
		await expect(selector).toBeVisible();
		await expect(selector.locator('a')).toHaveCount(9);
	});

	test('page has no JavaScript errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/trading-view/vaults/historical-tvl-chain');

		const chart = page.getByTestId('vault-scatter-plot').locator('.chart-canvas canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });

		expect(errors).toHaveLength(0);
	});
});
