import { expect, test, type Page } from '@playwright/test';

async function openChartsMenu(page: Page) {
	const nav = page.locator('.vault-listings-selector');
	const trigger = nav.locator('button', { hasText: 'Charts' });
	const menu = page.locator('[role="menu"][data-state="open"]');

	await page.waitForLoadState('networkidle');
	await expect(trigger).toBeVisible();

	for (let attempt = 0; attempt < 2; attempt++) {
		await trigger.click();

		try {
			await expect(menu).toBeVisible({ timeout: 10000 });
			return { trigger, menu };
		} catch (error) {
			if (attempt === 1) throw error;
			await page.waitForLoadState('networkidle');
		}
	}

	throw new Error('Failed to open Charts dropdown');
}

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

		test('clicking Charts opens dropdown with 6 chart links', async ({ page }) => {
			const { menu } = await openChartsMenu(page);

			const items = menu.locator('[role="menuitem"]');
			await expect(items).toHaveCount(6);

			await expect(menu).toContainText('Yield / Risk');
			await expect(menu).toContainText('Yield / Protocol');
			await expect(menu).toContainText('Yield / Chain');
			await expect(menu).toContainText('Current / Peak TVL');
			await expect(menu).toContainText('Total vault earnings');
			await expect(menu).toContainText('Historical TVL by chain');
		});

		test('clicking a chart link navigates to the chart page', async ({ page }) => {
			const { menu } = await openChartsMenu(page);
			await menu.locator('a', { hasText: 'Yield / Risk' }).click();

			await expect(page).toHaveURL(/\/trading-view\/vaults\/yield-risk/);
		});

		test('clicking trigger again closes the dropdown', async ({ page }) => {
			const { trigger, menu } = await openChartsMenu(page);

			await trigger.click();
			await expect(menu).toHaveCount(0);
		});

		test('clicking outside closes the dropdown', async ({ page }) => {
			const { menu } = await openChartsMenu(page);

			// Click outside the dropdown
			await page.locator('h1').click();
			await expect(menu).toHaveCount(0);
		});

		test('Charts trigger shows active state on a chart page', async ({ page }) => {
			await page.goto('/trading-view/vaults/yield-risk');

			const nav = page.locator('.vault-listings-selector');
			const trigger = nav.locator('button', { hasText: 'Charts' });
			await expect(trigger).toHaveClass(/active/);
		});

		test('active chart link is highlighted inside the dropdown', async ({ page }) => {
			await page.goto('/trading-view/vaults/yield-risk');

			const { menu } = await openChartsMenu(page);
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
			const { menu } = await openChartsMenu(page);
			await menu.locator('a', { hasText: 'Yield / Chain' }).click();
			await expect(page).toHaveURL(/\/trading-view\/vaults\/yield-chain/);
		});

		test('clicking outside closes the dropdown on mobile', async ({ page }) => {
			const { menu } = await openChartsMenu(page);

			// Click a named element outside the dropdown; force bypasses actionability
			// checks in case the menu positioner layer overlaps it on mobile
			await page.locator('h1').click({ force: true });
			await expect(menu).toHaveCount(0);
		});
	});
});
