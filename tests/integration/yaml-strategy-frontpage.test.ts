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
});
