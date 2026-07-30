import { expect, test } from '@playwright/test';

const entityQueries = [
	['vault', 'Savings USDS'],
	['chain', 'Ethereum'],
	['stablecoin', 'USDC'],
	['curator', 'Steakhouse'],
	['protocol', 'Aave'],
	['blacklisted-vault', 'Abnormal TVL blacklisted vault']
] as const;
const savingsUsdsAddressQuery = '0xA3931D71';
const savingsUsdsAddressPrefix = '0xa3931d71';

function parseCompactDollar(value: string) {
	const match = value.replace(/[$,\s]/g, '').match(/^([\d.]+)([KMBT])?$/);
	if (!match) return Number.NEGATIVE_INFINITY;
	const multiplier = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[match[2] as 'K' | 'M' | 'B' | 'T'] ?? 1;
	return Number(match[1]) * multiplier;
}

test.describe('site search typeahead', () => {
	test('shows typeahead results and opens the selected entity', async ({ page }) => {
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await expect(search).toHaveAttribute('placeholder', 'Search vaults');
		await search.focus();
		await search.fill('Steakhouse');

		const curatorSuggestion = page.locator('[role="option"][data-entity-type="curator"]');
		await expect(curatorSuggestion).toBeVisible();
		await expect(curatorSuggestion).toContainText('Steakhouse Financial');
		await expect(curatorSuggestion).toContainText('Curator');
		const curatorType = curatorSuggestion.locator('.entity-type');
		const curatorMarker = curatorSuggestion.locator('.entity-type-marker');
		await expect(curatorMarker).toBeVisible();
		expect(await curatorMarker.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
			await curatorType.evaluate((element) => getComputedStyle(element).color)
		);

		await search.press('ArrowDown');
		await expect(search).toHaveAttribute('aria-activedescendant', /site-search-suggestions-0/);
		await search.press('Enter');
		await expect(page).toHaveURL(/\/vaults\/curators\/steakhouse-financial$/);
	});

	test('closes quick results when Enter opens the full search page', async ({ page }) => {
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.fill('Euler');
		await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();

		await search.press('Enter');
		await expect(page).toHaveURL(/\/search\?q=Euler$/);
		await expect(page.getByRole('heading', { name: 'Search vaults' })).toBeVisible();
		await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
	});

	test('closes desktop quick results when interacting outside search', async ({ page }) => {
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.fill('Euler');
		const dialog = page.getByRole('dialog', { name: 'Search' });
		await expect(dialog).toBeVisible();

		await page.getByTestId('top-vaults-meta').click();
		await expect(dialog).toBeHidden();
	});

	test('opens a vault result from a nested page without a route-relative 404', async ({ page }) => {
		await page.goto('/vaults/curators/steakhouse-financial');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.fill('Savings USDS');

		const vaultSuggestion = page
			.locator('[role="option"][data-entity-type="vault"]')
			.filter({ hasText: 'Savings USDS' })
			.first();
		await expect(vaultSuggestion).toBeVisible();
		await expect(vaultSuggestion).toHaveAttribute('href', /^\/vaults\/[^/]+$/);
		const href = await vaultSuggestion.getAttribute('href');
		await vaultSuggestion.click();

		await page.waitForURL((url) => url.pathname === href);
		await expect(page.getByRole('heading', { name: /Savings USDS/i }).first()).toBeVisible();
		await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
	});

	test('opens the full-screen compact-navigation search dialog', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		const trigger = page.getByRole('button', { name: 'Open search' });
		await trigger.click();
		const search = page.getByRole('dialog', { name: 'Search' }).getByRole('combobox');
		await expect(search).toBeFocused();
		await search.fill('USDC');
		await expect(page.locator('[role="option"][data-entity-type="stablecoin"]')).toBeVisible();

		await page.getByRole('button', { name: 'Close search' }).click();
		await expect(trigger).toBeFocused();
	});

	test('searches and opens a result from the mobile navigation drawer', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'Show navigation panel' }).click();
		const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' });
		await expect(mobileNavigation).toHaveClass(/open/);
		const menuSearch = mobileNavigation.getByRole('button', { name: 'Search vaults' });
		await expect(menuSearch).toBeVisible();
		await menuSearch.click();

		const dialog = page.getByRole('dialog', { name: 'Search' });
		const search = dialog.getByRole('combobox');
		await search.fill('Savings USDS');

		const vaultSuggestion = dialog
			.locator('[role="option"][data-entity-type="vault"]')
			.filter({ hasText: 'Savings USDS' })
			.first();
		await expect(vaultSuggestion).toBeVisible();
		await vaultSuggestion.click();

		await expect(page).toHaveURL(/\/vaults\/savings-usds$/);
		await expect(page.getByRole('heading', { name: /Savings USDS/i }).first()).toBeVisible();
		await expect(dialog).toBeHidden();
		await expect(mobileNavigation).not.toHaveClass(/open/);
	});

	test('finds a vault by address without case sensitivity and shows its address prefix', async ({ page }) => {
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.focus();
		await search.fill(savingsUsdsAddressQuery);

		const vaultSuggestion = page.locator('[role="option"][data-entity-type="vault"]').first();
		await expect(vaultSuggestion).toContainText('Savings USDS');
		await expect(vaultSuggestion).toContainText(savingsUsdsAddressPrefix);
	});

	test('marks blacklisted vault suggestions as a separate struck-through entity type', async ({ page }) => {
		await page.goto('/vaults');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.fill('Abnormal TVL blacklisted vault');

		const suggestion = page.locator('[role="option"][data-entity-type="blacklisted-vault"]').first();
		await expect(suggestion).toContainText('Blacklisted vault');
		await expect(suggestion.locator('strong')).toHaveCSS('text-decoration-line', 'line-through');
	});

	test('renders suggestions on an opaque layer above page content', async ({ page }) => {
		await page.goto('/search');
		await page.waitForLoadState('networkidle');

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.focus();
		await search.fill('USDC');

		const dialog = page.getByRole('dialog', { name: 'Search' });
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('[role="option"]').first()).toBeVisible();

		const layer = await dialog.evaluate((element) => {
			const dialogRect = element.getBoundingClientRect();
			const pageInput = document.querySelector<HTMLInputElement>('#search-page-input');
			const inputRect = pageInput?.getBoundingClientRect();
			const overlapsPageInput = Boolean(
				inputRect &&
				dialogRect.left < inputRect.right &&
				dialogRect.right > inputRect.left &&
				dialogRect.top < inputRect.bottom &&
				dialogRect.bottom > inputRect.top
			);
			const x = inputRect
				? (Math.max(dialogRect.left, inputRect.left) + Math.min(dialogRect.right, inputRect.right)) / 2
				: dialogRect.left + 8;
			const y = inputRect
				? (Math.max(dialogRect.top, inputRect.top) + Math.min(dialogRect.bottom, inputRect.bottom)) / 2
				: dialogRect.top + 8;
			const topElement = document.elementsFromPoint(x, y)[0];

			return {
				backgroundColor: getComputedStyle(element).backgroundColor,
				overlapsPageInput,
				dialogIsTopLayer: element === topElement || element.contains(topElement)
			};
		});

		expect(layer.backgroundColor).not.toMatch(/^rgba\(/);
		expect(layer.overlapsPageInput).toBe(true);
		expect(layer.dialogIsTopLayer).toBe(true);
	});
});

test.describe('search results page', () => {
	test('keeps the search action compact at tablet widths', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 900 });
		await page.goto('/search?q=keyring');

		const form = page.locator('.search-form');
		const input = form.locator('#search-page-input');
		const submit = form.getByRole('button', { name: 'Search', exact: true });
		const [inputBox, submitBox] = await Promise.all([input.boundingBox(), submit.boundingBox()]);

		expect(inputBox).not.toBeNull();
		expect(submitBox).not.toBeNull();
		expect(submitBox!.width).toBeLessThan(inputBox!.width);
		expect(Math.abs(submitBox!.y + submitBox!.height - (inputBox!.y + inputBox!.height))).toBeLessThanOrEqual(1);
	});

	test('shows 90-day mini price maps for vaults only on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/search?q=Savings%20USDS');

		const vaultRow = page
			.locator('tbody tr')
			.filter({ has: page.locator('td.full_name', { hasText: 'Vault' }) })
			.first();
		await expect(page.getByRole('columnheader', { name: 'History 3M' })).toBeVisible();
		await expect(vaultRow.locator('td.sparkline .vault-sparkline')).toBeVisible();

		await page.goto('/search?q=Steakhouse');
		const curatorRow = page
			.locator('tbody tr')
			.filter({ has: page.locator('td.full_name', { hasText: 'Curator' }) })
			.first();
		await expect(curatorRow).toBeVisible();
		await expect(curatorRow.locator('td.sparkline .vault-sparkline')).toHaveCount(0);

		const search = page.getByTestId('nav-search').getByRole('combobox');
		await search.fill('Savings USDS');
		const quickMenu = page.getByRole('dialog', { name: 'Search' });
		await expect(quickMenu).toBeVisible();
		expect((await quickMenu.boundingBox())?.width).toBeGreaterThanOrEqual(700);
		await expect(quickMenu.locator('[role="option"][data-entity-type="vault"] .vault-sparkline').first()).toBeVisible();
		await search.fill('Steakhouse');
		await expect(quickMenu.locator('[role="option"][data-entity-type="curator"]')).toBeVisible();
		await expect(quickMenu.locator('[role="option"][data-entity-type="curator"] .vault-sparkline')).toHaveCount(0);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/search?q=Savings%20USDS');
		await expect(vaultRow.locator('td.sparkline')).toBeHidden();
	});

	test('sorts normal results by latest TVL and blacklisted vaults last by default', async ({ page }) => {
		await page.goto('/search?q=Morpho');

		const tvlHeader = page.getByRole('columnheader', { name: 'Latest TVL' });
		await expect(tvlHeader).toHaveClass(/sorted/);

		const rows = await page.locator('tbody tr').evaluateAll((elements) =>
			elements.map((element) => ({
				entityType: element.querySelector('td.full_name')?.textContent?.trim(),
				tvl: element.querySelector('td.tvl')?.textContent?.trim() ?? ''
			}))
		);
		expect(rows.length).toBeGreaterThan(1);

		const firstBlacklistedIndex = rows.findIndex(({ entityType }) => entityType === 'Blacklisted vault');
		expect(firstBlacklistedIndex).toBeGreaterThan(0);
		expect(rows.slice(firstBlacklistedIndex).every(({ entityType }) => entityType === 'Blacklisted vault')).toBe(true);

		for (const partition of [rows.slice(0, firstBlacklistedIndex), rows.slice(firstBlacklistedIndex)]) {
			const tvls = partition.map(({ tvl }) => parseCompactDollar(tvl));
			expect(tvls).toEqual([...tvls].sort((a, b) => b - a));
		}
	});

	test('sorts results by entity type', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/search?q=Morpho');

		const entityTypeHeader = page.getByRole('columnheader', { name: 'Entity type' });
		await entityTypeHeader.click();
		await expect(entityTypeHeader).toHaveClass(/sorted/);
		await entityTypeHeader.click();

		const entityTypes = await page.locator('tbody tr td.full_name').allTextContents();
		const labels = entityTypes.map((label) => label.trim());
		expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
	});

	test('finds and visibly distinguishes every entity result type', async ({ page }) => {
		await page.goto('/search?q=Savings%20USDS');
		await expect(page.getByTestId('nav-search')).toBeVisible();
		await expect(page.locator('table.search-results-table')).toHaveClass(/\bdatatable\b/);
		await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Entity type' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'APY 1M' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Latest TVL' })).toBeVisible();

		const entityColours = new Set<string>();
		for (const [entityType, query] of entityQueries) {
			await page.goto(`/search?q=${encodeURIComponent(query)}`);
			await expect(page.getByRole('searchbox')).toHaveValue(query);

			const entityLabel =
				entityType === 'stablecoin'
					? 'Stablecoin'
					: entityType === 'blacklisted-vault'
						? 'Blacklisted vault'
						: entityType[0].toUpperCase() + entityType.slice(1);
			const result = page
				.locator('tbody tr')
				.filter({ has: page.locator('td.full_name', { hasText: entityLabel }) })
				.first();
			await expect(result).toBeVisible();
			await expect(result.locator('td.full_name')).toHaveText(entityLabel);
			await expect(result.locator('td.name')).not.toBeEmpty();
			await expect(result.locator('td.avg_apy')).toBeVisible();
			await expect(result.locator('td.tvl')).toBeVisible();
			const entityTypeLabel = result.locator('td.full_name .group-name');
			const entityTypeMarker = entityTypeLabel.locator('.entity-type-marker');
			await expect(entityTypeMarker).toBeVisible();
			const textColour = await entityTypeLabel.evaluate((element) => getComputedStyle(element).color);
			expect(await entityTypeMarker.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(textColour);
			entityColours.add(textColour);
			if (entityType === 'blacklisted-vault') {
				await expect(result.locator('td.name .group-name')).toHaveCSS('text-decoration-line', 'line-through');
			}
		}
		expect(entityColours.size).toBe(entityQueries.length);
	});

	test('submits a search from the results page and preserves the query when navigating back', async ({ page }) => {
		await page.goto('/search');
		await page.waitForLoadState('networkidle');
		const search = page.locator('#search-page-input');
		await search.fill('Savings USDS');
		await search.press('Enter');
		await expect(page).toHaveURL(/\/search\?q=Savings(?:\+|%20)USDS/);

		const resultRow = page
			.locator('tbody tr')
			.filter({ has: page.locator('td.full_name', { hasText: 'Vault' }) })
			.first();
		await resultRow.click();
		await expect(page).toHaveURL(/\/vaults\//);
		await page.goBack();
		await expect(page.locator('#search-page-input')).toHaveValue('Savings USDS');
	});

	test('finds a vault by mixed-case address and displays its address prefix', async ({ page }) => {
		await page.goto(`/search?q=${encodeURIComponent(savingsUsdsAddressQuery)}`);

		const vaultResult = page
			.locator('tbody tr')
			.filter({ has: page.locator('td.full_name', { hasText: 'Vault' }) })
			.first();
		await expect(vaultResult).toContainText('Savings USDS');
		await expect(vaultResult.locator('td.name')).toContainText(savingsUsdsAddressPrefix);
	});
});
