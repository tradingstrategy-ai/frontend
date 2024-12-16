import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	// This test is useful for validating that custom fonts are installed and loaded.
	// If there's a legitimate change to the hero banner, generate new screenshots:
	// $ ./scripts/update-test-screenshots.sh
	test('hero banner looks correct', async ({ page }) => {
		const header = page.getByTestId('home-hero-banner');
		await expect(header).toHaveScreenshot({ maxDiffPixels: 150 });
	});

	test('home page has impressive numbers', async ({ page }) => {
		// NOTE: getByRole does not work for <a> tag with display:contents
		const tiles = page.getByTestId('impressive-numbers').locator('a[href]');

		const pairs = tiles.filter({ hasText: '15,000 trading pairs' });
		await expect(pairs).toHaveAttribute('href', '/trading-view/trading-pairs');

		const liquidity = tiles.filter({ hasText: '$1.23B liquidity' });
		await expect(liquidity).toHaveAttribute('href', '/trading-view/trading-pairs');

		const blockchains = tiles.filter({ hasText: '3 blockchains' });
		await expect(blockchains).toHaveAttribute('href', '/trading-view/blockchains');
	});
});
