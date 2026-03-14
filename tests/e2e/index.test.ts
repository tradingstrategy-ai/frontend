import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display hero banner', async ({ page }) => {
		const hero = page.getByTestId('home-hero-banner');
		await expect(hero).toBeVisible();
		await expect(hero).toHaveText(/Data-driven DeFi vault investing/);
	});

	test('should include blog roll', async ({ page }) => {
		const blogRoll = page.locator('[data-testid="blog-roll"]:visible');
		await expect(blogRoll.getByRole('link', { name: 'Read post' })).toHaveCount(3);
	});
});
