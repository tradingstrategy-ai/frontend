import { expect, test } from '@playwright/test';

const searchName = 'Search vaults and DeFi entities';

async function searchFromNavigation(page: import('@playwright/test').Page, query: string) {
	const navToggle = page.getByRole('button', { name: 'Show navigation panel' });
	let search = page.getByRole('combobox', { name: searchName });
	if (await navToggle.isVisible()) {
		await expect
			.poll(async () => {
				if ((await navToggle.getAttribute('aria-expanded')) !== 'true') await navToggle.click();
				return navToggle.getAttribute('aria-expanded');
			})
			.toBe('true');
		const navPanel = page.locator('.nav-panel nav');
		await expect(navPanel).toHaveClass(/open/);
		await navPanel.getByRole('button', { name: 'Search vaults' }).click();
		const entitySearch = navPanel.getByTestId('entity-search');
		await expect(entitySearch).toHaveClass(/open/);
		search = entitySearch.getByRole('combobox', { name: searchName });
	}

	await expect(search).toBeVisible();
	await search.focus();
	await search.fill(query);
	const results = page.getByTestId('entity-search-results');
	await expect(results.getByRole('option').first()).toBeVisible();
	return results;
}

test.describe('navigation entity search', () => {
	test('shows a colour-coded protocol entity before matching vaults on iPad', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/pricing');
		const results = await searchFromNavigation(page, 'Yearn');

		const firstResult = results.getByRole('option').first();
		await expect(firstResult).toHaveAttribute('data-entity-type', 'protocol');
		await expect(firstResult).toContainText('Yearn');
		await expect(firstResult.locator('.entity-type')).toContainText('Protocol');
		const [typeColour, markerColour] = await firstResult.locator('.entity-type').evaluate((element) => {
			const marker = element.querySelector('.entity-type-marker')!;
			return [getComputedStyle(element).color, getComputedStyle(marker).backgroundColor];
		});
		expect(markerColour).toBe(typeColour);
	});

	test('keeps the iPad landscape navigation menu aligned to the header edge', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 768 });
		await page.goto('/pricing');

		const menu = page.getByRole('button', { name: 'Show navigation panel' });
		await expect(menu).toBeVisible();
		const bounds = await menu.boundingBox();

		expect(bounds).not.toBeNull();
		expect(1024 - (bounds!.x + bounds!.width)).toBeLessThanOrEqual(32);
	});

	test('opens the complete search page when Enter is pressed without selecting a suggestion', async ({ page }) => {
		await page.goto('/pricing');

		const search = page.getByRole('combobox', { name: searchName });
		await search.fill('Yearn');
		await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
		await search.press('Enter');

		await expect(page).toHaveURL(/\/search\?q=Yearn$/);
		await expect(page.getByRole('heading', { name: 'Search vaults' })).toBeVisible();
	});

	for (const { name, options } of [
		{ name: 'desktop', options: { viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false } },
		{ name: 'iPad landscape', options: { viewport: { width: 1024, height: 768 }, isMobile: true, hasTouch: true } },
		{ name: 'iPhone', options: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true } }
	]) {
		test(`finds protocols and vaults through the rendered search on ${name}`, async ({ browser }) => {
			const context = await browser.newContext(options);
			const page = await context.newPage();
			await page.goto('/pricing');

			const protocolResults = await searchFromNavigation(page, 'Yearn');
			await expect(protocolResults.getByRole('option').first()).toHaveAttribute('data-entity-type', 'protocol');
			await expect(protocolResults.getByRole('option').first()).toContainText('Yearn');
			if (name === 'iPad landscape') {
				await expect(protocolResults.getByRole('option').first()).toHaveClass(/no-logo/);
			}

			const search = page.getByRole('combobox', { name: searchName });
			await search.fill('Savings USDS');
			const vaultResult = protocolResults
				.locator('[role="option"][data-entity-type="vault"]', {
					hasText: 'Savings USDS'
				})
				.first();
			await expect(vaultResult).toBeVisible();
			await expect(vaultResult).not.toContainText('3M price');

			if (name === 'iPad landscape') {
				const resultListBounds = await protocolResults.getByRole('listbox').boundingBox();
				const searchBounds = await search.boundingBox();
				const logoBounds = await vaultResult.locator('.logo-slot').boundingBox();
				const vaultNameBounds = await vaultResult.locator('.result-main').boundingBox();
				const vaultSparklineBounds = await vaultResult.locator('.result-sparkline').boundingBox();
				const vaultMetricsBounds = await vaultResult.locator('.metrics').boundingBox();
				expect(resultListBounds).not.toBeNull();
				expect(searchBounds).not.toBeNull();
				expect(resultListBounds!.width).toBeLessThanOrEqual(500);
				expect(Math.abs(resultListBounds!.width - searchBounds!.width)).toBeLessThanOrEqual(1);
				expect(Math.abs(resultListBounds!.x - searchBounds!.x)).toBeLessThanOrEqual(1);
				expect(vaultNameBounds).not.toBeNull();
				expect(vaultSparklineBounds).not.toBeNull();
				expect(vaultMetricsBounds).not.toBeNull();
				const leftContentBounds = logoBounds ?? vaultNameBounds!;
				const leftInset = leftContentBounds.x - resultListBounds!.x;
				const rightInset =
					resultListBounds!.x + resultListBounds!.width - (vaultMetricsBounds!.x + vaultMetricsBounds!.width);
				expect(Math.abs(leftInset - rightInset)).toBeLessThanOrEqual(1);
				expect(vaultSparklineBounds!.y - vaultNameBounds!.y).toBeLessThan(32);
				expect(vaultMetricsBounds!.y - vaultNameBounds!.y).toBeLessThan(32);
			}

			if (name === 'iPhone') {
				const dialog = page.getByRole('dialog', { name: 'Search' });
				const bounds = await dialog.boundingBox();
				const vaultBounds = await vaultResult.boundingBox();
				const vaultNameBounds = await vaultResult.locator('.result-main').boundingBox();
				const vaultSparklineBounds = await vaultResult.locator('.result-sparkline').boundingBox();
				const vaultMetricsBounds = await vaultResult.locator('.metrics').boundingBox();
				expect(bounds).not.toBeNull();
				expect(bounds!.x).toBeGreaterThanOrEqual(0);
				expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
				expect(bounds!.width).toBeGreaterThanOrEqual(343);
				expect(vaultBounds).not.toBeNull();
				expect(vaultNameBounds).not.toBeNull();
				expect(vaultSparklineBounds).not.toBeNull();
				expect(vaultMetricsBounds).not.toBeNull();
				expect(vaultSparklineBounds!.y).toBeGreaterThan(vaultNameBounds!.y);
				expect(vaultMetricsBounds!.y - vaultNameBounds!.y).toBeLessThan(32);
				expect(vaultSparklineBounds!.y).toBeGreaterThan(vaultMetricsBounds!.y);
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
			}

			await context.close();
		});
	}

	test('returns equivalent rendered entity results on desktop, tablet and mobile', async ({ browser }) => {
		const viewports = [
			{ name: 'desktop', viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false },
			{ name: 'tablet', viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
			{ name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
		];
		const resultSets: string[][] = [];

		for (const options of viewports) {
			const context = await browser.newContext(options);
			const page = await context.newPage();
			await page.goto('/pricing');
			const results = await searchFromNavigation(page, 'Yearn');
			resultSets.push(
				await results
					.getByRole('option')
					.evaluateAll((options) =>
						options.map((option) => `${option.getAttribute('data-entity-type')}:${option.getAttribute('href')}`)
					)
			);
			await context.close();
		}

		expect(resultSets[0]).toEqual(resultSets[1]);
		expect(resultSets[1]).toEqual(resultSets[2]);
	});
});
