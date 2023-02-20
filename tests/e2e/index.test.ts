import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display impressive numbers', async ({ page }) => {
		const impressiveSection = page.getByText(/Market data and trading strategy framework/);
		await expect(impressiveSection).toHaveText(/[\d.,]+ trading pairs/);
		await expect(impressiveSection).toHaveText(/\$[\d.,]+[kMB] liquidity/);
		await expect(impressiveSection).toHaveText(/\d blockchains/);
	});

	test('should display best/worst performing trades', async ({ page }) => {
		const best = page.locator('.summary-box:has-text("Most profitable 24h")');
		await expect(best.getByRole('row')).toHaveCount(5);
		const worst = page.locator('.summary-box:has-text("Worst performance 24h")');
		await expect(worst.getByRole('row')).toHaveCount(5);
	});

	test('should include blog roll', async ({ page }) => {
		const blogRoll = page.locator('[data-testid="blog-roll"]:visible');
		await expect(blogRoll.getByRole('link', { name: 'Read article' })).toHaveCount(6);
	});
});
