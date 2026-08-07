import { expect, test } from '@playwright/test';

const searchName = 'Search vaults and DeFi entities';

test('opens compact navigation on the first tap after page load', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 768 });
	await page.goto('/pricing', { waitUntil: 'commit' });
	const toggle = page.getByTestId('navigation-toggle');
	const checkbox = page.getByRole('checkbox');
	await toggle.click();

	const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
	await expect(checkbox).toHaveAttribute('data-navigation-hydrated', 'true');
	await expect(page.getByRole('checkbox', { name: 'Hide navigation panel' })).toBeChecked();
	await expect(page.locator('body')).toHaveCSS('position', 'fixed');
	const bounds = await navigation.boundingBox();
	expect(bounds).not.toBeNull();
	expect(bounds!.x).toBeCloseTo(0, 0);
	expect(bounds!.width).toBeCloseTo(1024, 0);
});

test('keeps the first tablet search tap focused through hydration', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 768 });
	await page.goto('/pricing', { waitUntil: 'commit' });
	const toggle = page.getByTestId('navigation-toggle');
	const checkbox = page.getByRole('checkbox');
	await toggle.click();
	const search = page.getByTestId('mobile-menu-search').getByRole('combobox', { name: searchName });
	await search.click();
	await expect(checkbox).toHaveAttribute('data-navigation-hydrated', 'true');
	await expect(search).toBeFocused();
});

test('tablet navigation closes after navigating to pricing', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 768 });
	await page.goto('/vaults');
	await page.getByTestId('navigation-toggle').click();

	const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
	await expect(navigation.getByRole('link', { name: 'Pricing' })).toBeVisible();
	await navigation.getByRole('link', { name: 'Pricing' }).click();

	await page.waitForURL('**/pricing');
	await expect(page.getByRole('heading', { name: 'Professional vault data analytics' })).toBeVisible();
	await expect(page.getByRole('checkbox', { name: 'Show navigation panel' })).not.toBeChecked();
	const bounds = await navigation.boundingBox();
	expect(bounds).not.toBeNull();
	expect(bounds!.x).toBeGreaterThanOrEqual(1024);
});

async function searchFromNavigation(page: import('@playwright/test').Page, query: string) {
	const navToggle = page.getByTestId('navigation-toggle');
	let search = page.getByTestId('nav-search').getByRole('combobox', { name: searchName });
	if (await navToggle.isVisible()) {
		await navToggle.click();
		const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
		const navigationBounds = await navigation.boundingBox();
		expect(navigationBounds).not.toBeNull();
		expect(navigationBounds!.x).toBeCloseTo(0, 0);
		expect(navigationBounds!.width).toBeCloseTo(await page.evaluate(() => window.innerWidth), 0);
		const menuSearch = navigation.getByRole('button', { name: 'Search vaults' });
		if ((await page.evaluate(() => window.innerWidth)) >= 768) {
			search = page.getByTestId('mobile-menu-search').getByRole('combobox', { name: searchName });
			await expect(search).toBeVisible();
			await expect(navigation.getByRole('link', { name: 'Top vaults' })).toBeVisible();
		} else {
			await expect(menuSearch).toBeVisible();
			await menuSearch.click();
			search = page.getByRole('dialog', { name: 'Search' }).getByRole('combobox', { name: searchName });
		}
	}
	await search.fill(query);
	const results = page.getByTestId('entity-search-results');
	await expect(results.getByRole('option').first()).toBeVisible();
	return results;
}

test('renders equivalent, colour-coded protocol and vault typeahead results on desktop, tablet and mobile', async ({
	page
}) => {
	const viewports = [
		{ name: 'desktop', viewport: { width: 1440, height: 1000 } },
		{ name: 'tablet', viewport: { width: 1024, height: 768 } },
		{ name: 'mobile', viewport: { width: 375, height: 667 } }
	];
	const resultSets: string[][] = [];

	for (const { name, viewport } of viewports) {
		await page.setViewportSize(viewport);
		await page.goto('/pricing');
		if (name === 'tablet') {
			const bounds = await page.getByTestId('navigation-toggle').boundingBox();
			expect(bounds).not.toBeNull();
			expect(1024 - (bounds!.x + bounds!.width)).toBeLessThanOrEqual(32);
		}

		const results = await searchFromNavigation(page, 'Yearn');
		const protocol = results.getByRole('option').first();
		await expect(protocol).toHaveAttribute('data-entity-type', 'protocol');
		await expect(protocol.locator('.entity-type')).toContainText('Protocol');
		const [typeColour, markerColour] = await protocol.locator('.entity-type').evaluate((element) => {
			const marker = element.querySelector('.entity-type-marker')!;
			return [getComputedStyle(element).color, getComputedStyle(marker).backgroundColor];
		});
		expect(markerColour).toBe(typeColour);
		resultSets.push(
			await results
				.getByRole('option')
				.evaluateAll((options) =>
					options.map((option) => `${option.getAttribute('data-entity-type')}:${option.getAttribute('href')}`)
				)
		);

		await page.getByRole('combobox', { name: searchName }).fill('Savings USDS');
		const vault = results.locator('[role="option"][data-entity-type="vault"]', { hasText: 'Savings USDS' }).first();
		await expect(vault).toBeVisible();
		await expect(vault).not.toContainText('3M price');
		await expect(vault.locator('.logo-slot img')).toHaveAttribute('src', '/brand-mark-100x100.png');
		const vaultContext = vault.locator('.vault-context');
		if (name === 'desktop') {
			await expect(vaultContext).toHaveAttribute('title', /.+ · .+/);
		} else {
			await expect(vaultContext).not.toBeVisible();
		}

		if (name === 'mobile') {
			const dialog = await page.getByRole('dialog', { name: 'Search' }).boundingBox();
			const nameBounds = await vault.locator('.result-main').boundingBox();
			const sparklineBounds = await vault.locator('.result-sparkline').boundingBox();
			expect(dialog).not.toBeNull();
			expect(dialog!.x).toBeGreaterThanOrEqual(0);
			expect(dialog!.x + dialog!.width).toBeLessThanOrEqual(375);
			expect(sparklineBounds!.y).toBeGreaterThan(nameBounds!.y);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
		}

		if (viewport.width < 1170) {
			if (viewport.width < 768) {
				await page.getByRole('button', { name: 'Close search' }).click();
			}
			await page.getByRole('button', { name: 'Close navigation panel' }).click();
		}
	}

	expect(resultSets[0]).toEqual(resultSets[1]);
	expect(resultSets[1]).toEqual(resultSets[2]);
});
