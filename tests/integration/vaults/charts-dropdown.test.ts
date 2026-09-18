import { expect, test, type Page } from '@playwright/test';
import { vaultChartLinks } from '../../../src/lib/top-vaults/vault-chart-links';
import { waitForHydration } from '../helpers';

async function openChartsMenu(page: Page) {
	await waitForHydration(page);
	await page.locator('.vault-listings-selector button', { hasText: 'Charts' }).click();

	const menu = page.locator('[role="menu"][data-state="open"]');
	await expect(menu).toBeVisible();
	return menu;
}

test.describe('charts dropdown in vault listings navigation', () => {
	test.describe('desktop viewport', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults');
		});

		test('lists the navigation in order and opens a Charts menu above the table', async ({ page }) => {
			const nav = page.locator('.vault-listings-selector');
			const navigationItems = nav.locator('a, button');

			await expect
				.poll(async () => (await navigationItems.allTextContents()).map((label) => label.trim()))
				.toEqual([
					'Top',
					'Stablecoins',
					'Chains',
					'Strategies',
					'Protocols',
					'Curators',
					'International',
					'Tokenised funds',
					'Charts',
					'More'
				]);

			const menu = await openChartsMenu(page);

			const items = menu.locator('[role="menuitem"]');
			await expect(items).toHaveCount(vaultChartLinks.length);
			for (const { label } of vaultChartLinks) {
				await expect(menu).toContainText(label);
			}

			// the open menu must own its own pixels, i.e. not be painted under the vault table
			const lastItem = items.last();
			const menuOwnsSamplePoint = await lastItem.evaluate((node) => {
				const rect = node.getBoundingClientRect();
				const sampleX = rect.left + rect.width / 2;
				const sampleY = rect.top + rect.height / 2;
				const topElement = document.elementFromPoint(sampleX, sampleY);
				return !!topElement && node.contains(topElement);
			});
			expect(menuOwnsSamplePoint).toBe(true);

			// click outside closes it (the unit test for DropdownMenu defers this to the browser)
			await page.locator('h1').click();
			await expect(menu).toHaveCount(0);
		});

		test('clicking a chart link navigates to the chart page', async ({ page }) => {
			const menu = await openChartsMenu(page);
			await menu.locator('a', { hasText: 'Yield / Risk' }).click();

			await expect(page).toHaveURL(/\/vaults\/yield-risk/);
		});
	});

	// Single owner of the active-state behaviour for every chart page; the chart-page test files
	// only assert their own chart rendering.
	test('marks the Charts trigger and the current chart link active on every chart page', async ({ page }) => {
		for (const { href, label } of vaultChartLinks) {
			await test.step(href, async () => {
				await page.goto(href);

				const nav = page.locator('.vault-listings-selector');
				await expect(nav).toBeVisible();
				const trigger = nav.locator('button', { hasText: 'Charts' });
				await expect(trigger).toHaveClass(/active/);

				const menu = await openChartsMenu(page);
				await expect(menu.locator('a.active')).toHaveText(label);
			});
		}
	});

	test.describe('mobile viewport', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/vaults');
		});

		test('opens and navigates on mobile', async ({ page }) => {
			const menu = await openChartsMenu(page);
			await menu.locator('a', { hasText: 'Yield / Chain' }).click();
			await expect(page).toHaveURL(/\/vaults\/yield-chain/);
		});

		test('closes on outside click on mobile', async ({ page }) => {
			const menu = await openChartsMenu(page);

			// Click a named element outside the dropdown; force bypasses actionability
			// checks in case the menu positioner layer overlaps it on mobile
			await page.locator('h1').click({ force: true });
			await expect(menu).toHaveCount(0);
		});
	});
});
