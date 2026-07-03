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

	test('marks depegged stablecoins in the table', async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoins');

		const fraxWarning = page.locator('td.full_name .group-name.warning').filter({ hasText: 'Frax' });
		const fraxRow = page.locator('tbody tr').filter({ has: fraxWarning });
		await expect(fraxWarning).toBeVisible();
		await expect(fraxWarning).toHaveAttribute('title', 'FRAX is below 90% of its native peg rate');
		await expect(fraxRow.locator('td.full_name svg')).toBeVisible();
		await expect(fraxRow.locator('td.name .group-name.warning')).toHaveCount(0);

		const warningColour = await fraxWarning.evaluate((element) => getComputedStyle(element).color);
		for (const selector of ['td.name', 'td.full_name', 'td.vault_count', 'td.avg_apy', 'td.tvl', 'td.cta .row-link']) {
			await expect(fraxRow.locator(selector)).toHaveCSS('color', warningColour);
		}
	});

	test('shows stablecoin price and CoinGecko link on stablecoin detail pages', async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoins/usdc');

		await expect(page.getByText('Stablecoin price')).toBeVisible();
		await expect(page.getByText('1 USDC = $1.00')).toBeVisible();
		await expect(page.getByText(/Fetched 2026.*ago/)).toBeVisible();
		await expect(page.getByRole('link', { name: 'CoinGecko' })).toHaveAttribute(
			'href',
			'https://www.coingecko.com/en/coins/usd-coin'
		);
	});

	test('shows USD exchange rate for non-USD stablecoin detail pages', async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoins/eura');

		await expect(page.getByText('Stablecoin price')).toBeVisible();
		await expect(page.getByText('1 EURA = €1.00')).toBeVisible();
		await expect(page.getByText('USD exchange rate')).toBeVisible();
		await expect(page.getByText('1 EURA = $1.14')).toBeVisible();
		await expect(page.getByText(/Fetched 2026.*ago/)).toHaveCount(2);
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

	test('uses the updated international vault metadata title and description', async ({ page }) => {
		await page.goto('/trading-view/vaults/international');

		await expect(page).toHaveTitle('International stablecoin vaults');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'DeFi vaults nominated in CHF, EUR, GBP, JPY, SGD, and TRY'
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			'content',
			'International stablecoin vaults'
		);
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
			'content',
			'DeFi vaults nominated in CHF, EUR, GBP, JPY, SGD, and TRY'
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
