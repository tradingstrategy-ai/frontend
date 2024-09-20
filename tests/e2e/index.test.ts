import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display impressive numbers', async ({ page }) => {
		const impressiveSection = page.getByTestId('impressive-numbers');
		await expect(impressiveSection).toHaveText(/[\d.,]+ trading pairs/);
		await expect(impressiveSection).toHaveText(/\$[\d.,]+[kMB] liquidity/);
		await expect(impressiveSection).toHaveText(/\d blockchains/);
	});

	test('should include blog roll', async ({ page }) => {
		const blogRoll = page.locator('[data-testid="blog-roll"]:visible');
		await expect(blogRoll.getByRole('link', { name: 'Read article' })).toHaveCount(6);
	});
});
