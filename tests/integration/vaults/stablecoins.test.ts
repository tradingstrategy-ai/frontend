import { expect, test } from '@playwright/test';

test.describe('stablecoins index page', () => {
	test('renders the ECharts pie chart and stablecoins table', async ({ page }) => {
		await page.goto('/vaults/stablecoins');

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
		await page.goto('/vaults/stablecoins');

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
		await page.goto('/vaults/stablecoins/usdc');

		await expect(page.getByText('Stablecoin price')).toBeVisible();
		await expect(page.getByText('1 USDC = $1.00')).toBeVisible();
		await expect(page.getByText(/Fetched 2026.*ago/)).toBeVisible();
		await expect(page.getByRole('link', { name: 'CoinGecko' })).toHaveAttribute(
			'href',
			'https://www.coingecko.com/en/coins/usd-coin'
		);
	});

	test('shows USD exchange rate for non-USD stablecoin detail pages', async ({ page }) => {
		await page.goto('/vaults/stablecoins/eura');

		await expect(page.getByText('Stablecoin price')).toBeVisible();
		await expect(page.getByText('1 EURA = €1.00')).toBeVisible();
		await expect(page.getByText('USD exchange rate')).toBeVisible();
		await expect(page.getByText('1 EURA = $1.14')).toBeVisible();
		await expect(page.getByText(/Fetched 2026.*ago/)).toHaveCount(2);
	});

	test('warns when a stablecoin is likely depegged', async ({ page }) => {
		await page.goto('/vaults/stablecoins/frax');

		const warning = page.getByTestId('stablecoin-depeg-warning');
		await expect(warning).toBeVisible();
		await expect(warning).toContainText('This stablecoin is likely depegged.');
		await expect(warning).toContainText('The current rate is 1.21951 FRAX / 1 USD');
		await expect(warning).toContainText('fetched at 2026-06-26 12:16');
	});

	test('shows a price-feed availability warning when the rate source is missing', async ({ page }) => {
		await page.goto('/vaults/stablecoins/ausd');

		const warning = page.getByTestId('stablecoin-price-feed-warning');
		await expect(warning).toBeVisible();
		await expect(warning).toHaveClass(/stablecoin-depeg-warning/);
		await expect(warning).toContainText(
			'This stablecoin does not have a price feed available at the moment and we are unable to display peg/depeg rates.'
		);
		await expect(warning.locator('.alert-list')).toHaveClass(/warning/);
		await expect(page.getByTestId('stablecoin-depeg-warning')).toHaveCount(0);
	});

	test('uses the updated metadata title and description', async ({ page }) => {
		await page.goto('/vaults/stablecoins');

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
		await page.goto('/vaults/international');

		await expect(page).toHaveTitle('International stablecoin vaults');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'DeFi vaults denominated in currencies such as CHF, EUR, GBP, JPY, SGD, and TRY.'
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			'content',
			'International stablecoin vaults'
		);
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
			'content',
			'DeFi vaults denominated in currencies such as CHF, EUR, GBP, JPY, SGD, and TRY.'
		);
	});

	test('has no JavaScript errors after the chart loads', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/vaults/stablecoins');

		const chart = page.locator('[data-testid="stablecoin-tvl-pie-chart"] canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });

		expect(errors).toHaveLength(0);
	});
});
