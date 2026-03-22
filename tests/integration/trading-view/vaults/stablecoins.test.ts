import { expect, test } from '@playwright/test';

test.describe('stablecoins index page', () => {
	test('loads the pie widget lazily', async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoins', { waitUntil: 'domcontentloaded' });

		const widget = page.locator('[data-testid="stablecoin-tvl-pie-chart"]');
		await expect(widget.locator('.loading-overlay')).toBeVisible();

		await page.waitForLoadState('load');
		await expect(widget.locator('canvas')).toBeVisible({ timeout: 15000 });
	});

	test('renders the ECharts pie chart and stablecoins table', async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoins');

		const chart = page.locator('[data-testid="stablecoin-tvl-pie-chart"] canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });
		await expect(page.locator('[data-testid="stablecoin-tvl-pie-chart"] [data-testid="chart-watermark"]')).toHaveCount(
			0
		);

		await expect(page.locator('h1')).toHaveText(/Vaults by stablecoin/);
		await expect(page.locator('table')).toBeVisible();
		await expect(page.locator('table')).toContainText('Stablecoin');
	});

	test('uses the updated metadata title and description', async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoins');

		await expect(page).toHaveTitle('Vaults by stablecoin');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'DeFi vaults for different stablecoins. TVL represents deposits of a stablecoin in vaults. APY represents the yield of last thirty days.'
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Vaults by stablecoin');
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
			'content',
			'DeFi vaults for different stablecoins. TVL represents deposits of a stablecoin in vaults. APY represents the yield of last thirty days.'
		);
	});

	test('has no JavaScript errors after the chart loads', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/trading-view/vaults/stablecoins');

		const chart = page.locator('[data-testid="stablecoin-tvl-pie-chart"] canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });

		expect(errors).toHaveLength(0);
	});

	test('shows split layout on desktop with the chart on the right', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/trading-view/vaults/stablecoins');

		const nav = page.locator('.stablecoin-index-page .vault-listings-selector');
		const introColumn = page.locator('.stablecoin-index-header .intro-column');
		const chartColumn = page.locator('.stablecoin-index-header .chart-column');

		await expect(nav).toBeVisible();
		await expect(chartColumn.locator('[data-testid="stablecoin-tvl-pie-chart"] canvas')).toBeVisible({
			timeout: 15000
		});

		const navBox = await nav.boundingBox();
		const introBox = await introColumn.boundingBox();
		const chartBox = await chartColumn.boundingBox();

		expect(navBox).toBeTruthy();
		expect(introBox).toBeTruthy();
		expect(chartBox).toBeTruthy();
		expect(navBox!.y + navBox!.height).toBeLessThan(chartBox!.y + 8);
		expect(chartBox!.x).toBeGreaterThan(introBox!.x);
		expect(Math.abs(chartBox!.y - introBox!.y)).toBeLessThan(32);
	});

	test('keeps the chart visible below the intro column on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto('/trading-view/vaults/stablecoins');

		const introColumn = page.locator('.stablecoin-index-header .intro-column');
		const chartColumn = page.locator('.stablecoin-index-header .chart-column');
		await expect(chartColumn.locator('[data-testid="stablecoin-tvl-pie-chart"] canvas')).toBeVisible({
			timeout: 15000
		});

		const introBox = await introColumn.boundingBox();
		const chartBox = await chartColumn.boundingBox();

		expect(introBox).toBeTruthy();
		expect(chartBox).toBeTruthy();
		expect(chartBox!.y).toBeGreaterThan(introBox!.y + introBox!.height - 8);
	});
});
