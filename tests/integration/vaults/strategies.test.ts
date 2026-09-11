import { expect, test } from '@playwright/test';

test.describe('vault strategy pages', () => {
	test('lists source strategy categories alphabetically with their descriptions and aggregate metrics', async ({
		page
	}) => {
		await page.goto('/vaults/strategies');

		await expect(page).toHaveTitle('Vaults by strategy | Trading Strategy');
		await expect(page.getByRole('heading', { name: 'Vaults by strategy', level: 1 })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Strategy' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Vaults' })).toBeVisible();
		await expect(page.getByRole('columnheader', { name: 'Avg. APY (30d)' })).toBeVisible();
		await expect(page.locator('.vault-protocol-table.without-rankings td.index')).toHaveCount(5);
		const indexCell = page.locator('.vault-protocol-table.without-rankings td.index').first();
		expect(await indexCell.evaluate((cell) => getComputedStyle(cell, '::before').content)).toBe('""');
		expect(await indexCell.evaluate((cell) => cell.getBoundingClientRect().width)).toBeGreaterThan(0);

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(5);
		await expect(page.getByText('Unknown strategy', { exact: true })).toHaveCount(0);
		await expect(rows.first()).toContainText('Algorithmic trading');
		await expect(rows.first()).toContainText('Systematic strategies that use algorithmic signals');
		await expect(rows.first().getByRole('link', { name: 'DeFi markets' })).toHaveAttribute(
			'href',
			'https://example.com/markets'
		);
	});

	test('keeps the mobile rank corner blank for Strategy sorting', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults/strategies');

		const row = page.locator('.vault-protocol-table.without-rankings tbody tr.targetable').first();
		expect(await row.evaluate((element) => getComputedStyle(element, '::before').content)).toBe('""');
		expect(await row.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(0);
	});

	test('uses dash-separated strategy routes, shows strategy details, and links vault strategy categories', async ({
		page
	}) => {
		await page.goto('/vaults/strategies/algorithmic_trading?sort=tvl&direction=desc');
		await expect(page).toHaveURL('/vaults/strategies/algorithmic-trading?sort=tvl&direction=desc');
		await expect(page.getByRole('heading', { name: 'Algorithmic trading vaults', level: 1 })).toBeVisible();
		await expect(page.getByText('Reported strategy totals:')).toBeVisible();
		await expect(page.locator('tbody tr.targetable').filter({ hasText: 'Trading Strategy ICHIv3 LS 2' })).toHaveCount(
			1
		);
		await expect(page.getByTestId('vault-group-mini-chart')).toBeVisible();

		await page.goto('/vaults/trading-strategy-ichiv3-ls-2');
		const categories = page.locator('.vault-categories');
		await expect(categories).toContainText('Strategy categories:');
		await expect(categories.getByRole('link', { name: 'Algorithmic trading' })).toHaveAttribute(
			'href',
			'/vaults/strategies/algorithmic-trading'
		);
		await expect(categories.getByRole('link', { name: 'Yield optimisation' })).toHaveAttribute(
			'href',
			'/vaults/strategies/yield-optimisation'
		);
	});

	test('redirects legacy category URLs to the strategy route while preserving search parameters', async ({ page }) => {
		await page.goto('/vaults/categories?sort=tvl&direction=desc');
		await expect(page).toHaveURL('/vaults/strategies?sort=tvl&direction=desc');

		await page.goto('/vaults/categories/algorithmic-trading?sort=tvl&direction=desc');
		await expect(page).toHaveURL('/vaults/strategies/algorithmic-trading?sort=tvl&direction=desc');
	});

	test('redirects legacy strategy chart data to the canonical route', async ({ request }) => {
		const response = await request.get('/vaults/categories/algorithmic-trading/chart-data?window=30d', {
			maxRedirects: 0
		});

		expect(response.status()).toBe(308);
		expect(response.headers()['location']).toBe('/vaults/strategies/algorithmic-trading/chart-data?window=30d');
	});

	test('redirects underscore chart-data URLs to the dash-form canonical route', async ({ request }) => {
		const response = await request.get('/vaults/strategies/algorithmic_trading/chart-data?window=30d', {
			maxRedirects: 0
		});

		expect(response.status()).toBe(301);
		expect(response.headers()['location']).toBe('/vaults/strategies/algorithmic-trading/chart-data?window=30d');
	});

	test('renders a registered zero-vault strategy category', async ({ page }) => {
		await page.goto('/vaults/strategies/zero-vault');

		await expect(page.getByRole('heading', { name: 'Zero vault vaults', level: 1 })).toBeVisible();
		await expect(page.getByText('Reported strategy totals: 0 vaults')).toBeVisible();
		await expect(page.locator('tbody tr.targetable')).toHaveCount(0);
		await expect(page.getByTestId('vault-group-mini-chart')).toHaveCount(0);
	});

	test('returns 404 for source tags that are not strategy categories', async ({ page }) => {
		const response = await page.goto('/vaults/strategies/constructor');
		expect(response?.status()).toBe(404);
	});

	test('does not expose the hidden unknown strategy category', async ({ page }) => {
		const response = await page.goto('/vaults/strategies/unknown');
		expect(response?.status()).toBe(404);

		const legacyResponse = await page.goto('/vaults/categories/unknown');
		expect(legacyResponse?.status()).toBe(404);
	});

	test('keeps URL-backed alternate sorting available', async ({ page }) => {
		await page.goto('/vaults/strategies?sort=tvl&direction=desc');

		await expect(page.locator('tbody tr.targetable').first()).toContainText('Directional trading');
		await expect(page.locator('.vault-protocol-table:not(.without-rankings) th.index:visible')).toHaveCount(1);
		await expect(page.locator('.vault-protocol-table:not(.without-rankings) td.index:visible')).toHaveCount(5);
	});

	test('returns an empty continuation for an unregistered category scope', async ({ request }) => {
		const response = await request.get('/top-vaults/listing-data?listing=category&scope=constructor');

		expect(response.status()).toBe(200);
		expect((await response.json()).vaults).toEqual([]);

		const hiddenResponse = await request.get('/top-vaults/listing-data?listing=category&scope=unknown');
		expect(hiddenResponse.status()).toBe(200);
		expect((await hiddenResponse.json()).vaults).toEqual([]);
	});
});
