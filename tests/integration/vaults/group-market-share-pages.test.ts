import { expect, test } from '@playwright/test';

const pages = [
	{
		name: 'protocols index page',
		url: '/vaults/protocols',
		heading: /Vault protocols/,
		chartHeading: /Market share by TVL/i,
		widgetTestId: 'protocol-tvl-pie-chart'
	},
	{
		name: 'stablecoins index page',
		url: '/vaults/stablecoins',
		heading: /Vaults by stablecoin/,
		chartHeading: /Market share by TVL/i,
		widgetTestId: 'stablecoin-tvl-pie-chart'
	},
	{
		name: 'chains index page',
		url: '/vaults/chains',
		heading: /DeFi vaults by chain/,
		chartHeading: /Market share by TVL/i,
		widgetTestId: 'chain-tvl-pie-chart'
	},
	{
		name: 'curators index page',
		url: '/vaults/curators',
		heading: /Stablecoin vault curators/,
		chartHeading: /Market share by TVL/i,
		widgetTestId: 'curator-tvl-pie-chart'
	},
	{
		name: 'tokenised funds index page',
		url: '/vaults/funds',
		heading: /Tokenised funds/,
		chartHeading: /Total .*tokenised fund NAV/i,
		widgetTestId: 'tokenised-fund-nav-pie-chart'
	}
] as const;

for (const pageConfig of pages) {
	test.describe(pageConfig.name, () => {
		test('loads the pie widget lazily', async ({ page }) => {
			await page.goto(pageConfig.url, { waitUntil: 'domcontentloaded' });

			const widget = page.locator(`[data-testid="${pageConfig.widgetTestId}"]`);
			await expect(widget.locator('.loading-overlay')).toBeVisible();

			await page.waitForLoadState('load');
			await expect(widget.locator('canvas')).toBeVisible({ timeout: 15000 });
		});

		test('renders the split header, chart, and table', async ({ page }) => {
			await page.goto(pageConfig.url);

			await expect(page.locator('h1')).toHaveText(pageConfig.heading);
			await expect(page.locator(`[data-testid="${pageConfig.widgetTestId}"] canvas`)).toBeVisible({
				timeout: 15000
			});
			await expect(page.locator('table')).toBeVisible();
			await expect(page.getByRole('heading', { name: pageConfig.chartHeading })).toBeVisible();
		});

		test('keeps the chart on the right on desktop', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 });
			await page.goto(pageConfig.url);

			const nav = page.locator('main .vault-listings-selector');
			const introColumn = page.locator('.vault-group-index-header .intro-column');
			const chartColumn = page.locator('.vault-group-index-header .chart-column');

			await expect(nav).toBeVisible();
			await expect(chartColumn.locator('canvas')).toBeVisible({ timeout: 15000 });

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
			await page.goto(pageConfig.url);

			const introColumn = page.locator('.vault-group-index-header .intro-column');
			const chartColumn = page.locator('.vault-group-index-header .chart-column');

			await expect(chartColumn.locator('canvas')).toBeVisible({ timeout: 15000 });

			const introBox = await introColumn.boundingBox();
			const chartBox = await chartColumn.boundingBox();

			expect(introBox).toBeTruthy();
			expect(chartBox).toBeTruthy();
			expect(chartBox!.y).toBeGreaterThan(introBox!.y + introBox!.height - 8);
		});

		test('stacks the chart below the intro column on a narrow iPad', async ({ page }) => {
			await page.setViewportSize({ width: 820, height: 1180 });
			await page.goto(pageConfig.url);

			const introColumn = page.locator('.vault-group-index-header .intro-column');
			const chartColumn = page.locator('.vault-group-index-header .chart-column');

			await expect(chartColumn.locator('canvas')).toBeVisible({ timeout: 15000 });

			const introBox = await introColumn.boundingBox();
			const chartBox = await chartColumn.boundingBox();

			expect(introBox).toBeTruthy();
			expect(chartBox).toBeTruthy();
			expect(chartBox!.y).toBeGreaterThan(introBox!.y + introBox!.height - 8);
		});
	});
}

test('protocols index links to CORE3 and Xerberus risk-rated vault listings', async ({ page }) => {
	await page.goto('/vaults/protocols');

	await expect(page.getByRole('link', { name: 'CORE3' })).toHaveAttribute('href', '/vaults/core3-ratings');
	await expect(page.getByRole('link', { name: 'Xerberus' })).toHaveAttribute('href', '/vaults/xerberus-ratings');
});
