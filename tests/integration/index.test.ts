import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should render the home page with correct title', async ({ page }) => {
		await expect(page).toHaveTitle('Trading Strategy - Algorithmic Trading Protocol');
	});

	test('should display featured strategies section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Trading Strategy vaults' })).toBeVisible();
	});

	test('should display top vaults section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Top DeFi Vaults' })).toBeVisible();
	});

	test('should display blog section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
	});
});
