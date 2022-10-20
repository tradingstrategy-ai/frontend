import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display impressive numbers', async ({ page }) => {
		const impressiveSection = page.getByText(/Market data and trading strategy framework/);
		await expect(impressiveSection.getByText(/[\d.,]+ trading pairs/)).toBeVisible();
		await expect(impressiveSection.getByText(/\$[\d.,]+[kMB] liquidity/)).toBeVisible();
		await expect(impressiveSection.getByText(/\d blockchains/)).toBeVisible();
	});

	test('should display best/worst performing trades', async ({ page }) => {
		const best = page.locator('[data-testid="top-momentum"]:has-text("Most profitable 24h")');
		await expect(best.getByRole('listitem')).toHaveCount(5);
		const worst = page.locator('[data-testid="top-momentum"]:has-text("Worst performance 24h")');
		await expect(worst.getByRole('listitem')).toHaveCount(5);
	});

	test('should include blog roll', async ({ page }) => {
		const blogItems = page.locator('[data-testid="blog-post-tile"]:visible');
		await expect(blogItems).toHaveCount(3);
	});
});
