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

/** Every page in the Charts menu and the label the menu must mark active there (see `VaultListingsSelector`). */
const chartPages = [
	['/vaults/compare', 'Compare equity curves'],
	['/vaults/cumulative-tvl-apy', 'Total vault earnings'],
	['/vaults/yield-risk', 'Yield / Risk'],
	['/vaults/yield-protocol', 'Yield / Protocol'],
	['/vaults/yield-chain', 'Yield / Chain'],
	['/vaults/current-peak-tvl', 'Current / Peak TVL'],
	['/vaults/core3-risk', 'CORE3 risk'],
	['/vaults/historical-tvl-chain', 'Historical TVL by chain'],
	['/vaults/historical-tvl-stablecoin', 'Historical TVL by stablecoin'],
	['/vaults/historical-tvl-protocol', 'Historical TVL by vault protocol'],
	['/vaults/stablecoin-chain-heatmap', 'Stablecoin / Chain heatmap']
] as const;

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

			const { menu } = await openChartsMenu(page);

			const items = menu.locator('[role="menuitem"]');
			await expect(items).toHaveCount(chartPages.length);
			for (const [, label] of chartPages) {
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
			const { menu } = await openChartsMenu(page);
			await menu.locator('a', { hasText: 'Yield / Risk' }).click();

			await expect(page).toHaveURL(/\/vaults\/yield-risk/);
		});
	});

	// Single owner of the active-state behaviour for every chart page; the chart-page test files
	// only assert their own chart rendering.
	test('marks the Charts trigger and the current chart link active on every chart page', async ({ page }) => {
		for (const [path, label] of chartPages) {
			await test.step(path, async () => {
				await page.goto(path);

				const nav = page.locator('.vault-listings-selector');
				await expect(nav).toBeVisible();
				const trigger = nav.locator('button', { hasText: 'Charts' });
				await expect(trigger).toHaveClass(/active/);

				const { menu } = await openChartsMenu(page);
				await expect(menu.locator('a.active')).toHaveText(label);
			});
		}
	});

	test.describe('mobile viewport', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto('/vaults');
		});

		test('opens, closes on outside click and navigates on mobile', async ({ page }) => {
			const { menu } = await openChartsMenu(page);

			// Click a named element outside the dropdown; force bypasses actionability
			// checks in case the menu positioner layer overlaps it on mobile
			await page.locator('h1').click({ force: true });
			await expect(menu).toHaveCount(0);

			const reopened = await openChartsMenu(page);
			await reopened.menu.locator('a', { hasText: 'Yield / Chain' }).click();
			await expect(page).toHaveURL(/\/vaults\/yield-chain/);
		});
	});
});
