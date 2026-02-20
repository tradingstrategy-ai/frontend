import { expect, test } from '@playwright/test';

test.describe('charts dropdown in vault listings navigation', () => {
	test.describe('desktop viewport', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults');
		});

		test('Charts trigger is visible in the nav', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await expect(trigger).toBeVisible();
		});

		test('clicking Charts opens dropdown with 4 chart links', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			await expect(menu).toBeVisible();

			const items = menu.locator('[role="menuitem"]');
			await expect(items).toHaveCount(4);

			await expect(menu).toContainText('Yield / Risk');
			await expect(menu).toContainText('Yield / Protocol');
			await expect(menu).toContainText('Yield / Chain');
			await expect(menu).toContainText('Current / Peak TVL');
		});

		test('clicking a chart link navigates to the chart page', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			await menu.locator('a', { hasText: 'Yield / Risk' }).click();

			await expect(page).toHaveURL(/\/trading-view\/vaults\/yield-risk/);
		});

		test('clicking trigger again closes the dropdown', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			await expect(menu).toBeVisible();

			await trigger.click();
			await expect(menu).not.toBeVisible();
		});

		test('clicking outside closes the dropdown', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			await expect(menu).toBeVisible();

			// Click outside the dropdown
			await page.locator('h1').click();
			await expect(menu).not.toBeVisible();
		});

		test('Charts trigger shows active state on a chart page', async ({ page }) => {
			await page.goto('/trading-view/vaults/yield-risk');

			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await expect(trigger).toHaveClass(/active/);
		});

		test('active chart link is highlighted inside the dropdown', async ({ page }) => {
			await page.goto('/trading-view/vaults/yield-risk');

			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			const activeLink = menu.locator('a.active');
			await expect(activeLink).toHaveText('Yield / Risk');
		});
	});

	test.describe('mobile viewport', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/trading-view/vaults');
		});

		test('Charts trigger is visible on mobile', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await expect(trigger).toBeVisible();
		});

		test('dropdown opens and navigates on mobile', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			await expect(menu).toBeVisible();

			await menu.locator('a', { hasText: 'Yield / Chain' }).click();
			await expect(page).toHaveURL(/\/trading-view\/vaults\/yield-chain/);
		});

		test('clicking outside closes the dropdown on mobile', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await trigger.click();

			const menu = page.locator('[role="menu"]');
			await expect(menu).toBeVisible();

			// Click outside the dropdown
			await page.locator('h1').click();
			await expect(menu).not.toBeVisible();
		});
	});
});
