import { expect, test } from '@playwright/test';

test.describe('YAML strategy on frontpage', () => {
	test('should display YAML strategy with frontpage flag on home page', async ({ page }) => {
		await page.goto('/');

		const heading = page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' });
		await expect(heading).toBeVisible();
	});

	test('should link to the YAML strategy detail page from frontpage', async ({ page }) => {
		await page.goto('/');

		const link = page.locator('a[href="/strategies/trading-strategy-ichiv3-ls-2"]');
		await expect(link.first()).toBeVisible();
	});

	test('should display vault metrics in the frontpage strategy tile', async ({ page }) => {
		await page.goto('/');

		const tile = page.locator('.strategy-tile').filter({ hasText: 'ICHI v3 Liquidity Strategy' });
		await expect(tile).toContainText('Annual return');
		await expect(tile).toContainText('TVL');
		await expect(tile).toContainText('Age');
		await expect(tile).toContainText('Sharpe');
	});

	test('should expose hidden freshness debug data on the home page', async ({ page }) => {
		await page.goto('/');

		const debugData = page.locator('[data-debug-freshness="home-page"]');
		await expect(debugData).toHaveCount(1);
		await expect(debugData).toContainText('topVaultsFeed');
		await expect(debugData).toContainText('yamlTileSharePriceCache');
	});
});
