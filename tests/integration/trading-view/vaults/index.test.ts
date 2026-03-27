import { expect, test } from '@playwright/test';

/** Check that a URL contains all expected search param key/value pairs */
function urlParamsMatch(expected: Record<string, string>) {
	return (url: URL) => Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value);
}

async function openAdvancedSettings(page: import('@playwright/test').Page) {
	await expect(page.locator('tbody tr.targetable').first()).toBeVisible();
	const advancedFilters = page.getByTestId('advanced-filters');
	await page.getByTestId('advanced-filters-summary').click();
	await expect(advancedFilters).toHaveJSProperty('open', true);
	await expect(page.locator('.advanced-filters-content')).toBeVisible();
}

async function closeAdvancedSettings(page: import('@playwright/test').Page) {
	const advancedFilters = page.getByTestId('advanced-filters');
	await page.getByTestId('advanced-filters-summary').click();
	await expect(advancedFilters).toHaveJSProperty('open', false);
}

async function toggleReturnOption(page: import('@playwright/test').Page, label: string) {
	await page.getByTestId('return-columns-menu').getByText(label, { exact: true }).click();
}

function returnColumnsTrigger(page: import('@playwright/test').Page) {
	return page.locator('.advanced-filters-content').getByTestId('return-columns-trigger');
}

async function expectLimitedDataTooltip(
	page: import('@playwright/test').Page,
	cell: import('@playwright/test').Locator,
	startDate: string,
	endDate: string,
	totalDays: number
) {
	await cell.hover();
	const popup = cell.locator('.popup');
	await expect(popup).toBeVisible();
	await expect(popup).toContainText('Limited data availability.');
	await expect(popup).toContainText(`Period ${startDate} - ${endDate}.`);
	await expect(popup).toContainText(`Total ${totalDays} days.`);
}

async function expectLifetimeDataTooltip(
	cell: import('@playwright/test').Locator,
	startDate: string,
	endDate: string,
	totalDays: number
) {
	await cell.hover();
	const popup = cell.locator('.popup');
	await expect(popup).toBeVisible();
	await expect(popup).toContainText(`Data starts: ${startDate}`);
	await expect(popup).toContainText(`Data ends: ${endDate}`);
	await expect(popup).toContainText(`Days of data: ${totalDays}`);
}

test.describe('vault index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults');
	});

	test('shows the default return columns', async ({ page }) => {
		const header = page.locator('thead');
		await expect(header).toContainText(/1M\s*return ann\./);
		await expect(header).toContainText(/3M\s*return ann\./);
		await expect(header).toContainText(/Lifetime\s*return abs\./);
	});

	test('shows lifetime data tooltip on the lifetime return cell', async ({ page }) => {
		const vaultSearch = page.getByTestId('vault-search');
		await vaultSearch.click();
		await vaultSearch.pressSequentially('Trading Strategy ICHIv3 LS 2');

		const row = page.locator('tbody tr.targetable').first();
		await expect(row).toContainText('Trading Strategy ICHIv3 LS 2');

		await expectLifetimeDataTooltip(
			row.locator('td.return-column-lifetime-abs .tooltip'),
			'2025-01-01',
			'2026-01-01',
			365
		);
	});

	test('shows only primary filters by default and toggles advanced settings', async ({ page }) => {
		const primaryFilters = page.locator('.primary-filters');
		await expect(primaryFilters.getByText('Technical risk', { exact: true })).toBeVisible();
		await expect(primaryFilters.getByText('Hide undepositable', { exact: true })).toBeVisible();
		await expect(primaryFilters.getByTestId('vault-search')).toBeVisible();

		const advanced = page.getByTestId('advanced-filters');
		await expect(advanced).not.toHaveAttribute('open', '');
		await expect(page.getByTestId('advanced-filters-summary')).toBeVisible();
		await expect(page.getByTestId('return-columns-trigger')).not.toBeVisible();
		await expect(page.locator('.advanced-filters-content').getByText('Min TVL')).not.toBeVisible();

		await openAdvancedSettings(page);

		await expect(page.locator('.advanced-filters-content').getByText('Min TVL')).toBeVisible();
		await expect(page.locator('.advanced-filters-content').getByText('Age', { exact: true })).toBeVisible();
		await expect(page.locator('.advanced-filters-content').getByText('Max drawdown')).toBeVisible();
		await expect(returnColumnsTrigger(page)).toBeVisible();
		await expect(page.getByTestId('advanced-filters-note')).toBeVisible();
		await expect(page.getByTestId('advanced-filters-note')).toContainText(
			'The filtering is for the current vault category list. For everything, you can filter on All vaults page.'
		);
		await expect(
			page.getByTestId('advanced-filters-note').getByRole('link', { name: 'All vaults page' })
		).toHaveAttribute('href', '/trading-view/vaults/all');

		await closeAdvancedSettings(page);
		await expect(advanced).not.toHaveAttribute('open', '');
		await expect(returnColumnsTrigger(page)).not.toBeVisible();
	});

	test('hides the all-vaults note on the all vaults page', async ({ page }) => {
		await page.goto('/trading-view/vaults/all');
		await openAdvancedSettings(page);
		await expect(page.getByTestId('advanced-filters-note')).toHaveCount(0);
	});

	test('displays vault count in table meta', async ({ page }) => {
		const meta = page.getByTestId('top-vaults-meta');
		// Should show 254 vaults (those above TVL threshold)
		await expect(meta).toContainText('254 vaults');
	});

	test('renders initial batch of 150 rows', async ({ page }) => {
		const rows = page.locator('tbody tr.targetable');
		// Wait for rows to be visible
		await expect(rows.first()).toBeVisible();
		await expect(rows).toHaveCount(150);
	});

	test('shows load-more sentinel when more rows available', async ({ page }) => {
		const sentinel = page.getByTestId('load-more-sentinel');
		await expect(sentinel).toBeVisible();
		await expect(sentinel).toContainText(/Loading more vaults/);
	});

	test('loads 50 more rows when scrolling to sentinel', async ({ page }) => {
		// Check initial row count
		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(150);

		// Scroll the sentinel into view
		const sentinel = page.getByTestId('load-more-sentinel');
		await sentinel.scrollIntoViewIfNeeded();

		// Confirm additional rows
		await expect(rows).toHaveCount(200);
	});

	test('sentinel disappears when all rows loaded', async ({ page }) => {
		const rows = page.locator('tbody tr.targetable');
		const sentinel = page.getByTestId('load-more-sentinel');

		// scroll once - loads additional 50
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(200);

		// scroll again - loads another 50
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(250);

		// scroll a third time - loads the final 4
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(254);

		// all rows loaded - no more sentinel
		await expect(sentinel).not.toBeVisible();
	});

	test('search filters displayed vaults', async ({ page }) => {
		const vaultSearch = page.getByTestId('vault-search');

		// Verify we have initial rows > 1
		const rows = page.locator('tbody tr.targetable');
		await expect(rows.first()).toBeVisible();
		const initialCount = await rows.count();
		expect(initialCount).toBeGreaterThan(1);

		// Use pressSequentially to simulate real keystrokes — Playwright's fill()
		// doesn't reliably trigger Svelte's on:input handler with one-way {value} binding
		await vaultSearch.click();
		await vaultSearch.pressSequentially('Above TVL 042');
		await expect(rows).toHaveCount(1);
	});

	test('selecting a fourth return column evicts the current third selection', async ({ page }) => {
		await openAdvancedSettings(page);
		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2C3m-ann%2C6m-ann/);
		await expect(page.locator('thead')).toContainText(/6M\s*return ann\./);
		await expect(page.locator('thead')).not.toContainText(/Lifetime\s*return abs\./);
	});

	test('removing the active return sort resets sorting to the first visible return column', async ({ page }) => {
		await page.goto('/trading-view/vaults?returns=1m-ann,6m-ann,lifetime-abs&sort=6m-ann&direction=asc');
		await expect(page).toHaveURL(/sort=6m-ann/);

		await openAdvancedSettings(page);
		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2Clifetime-abs/);
		await expect(page).not.toHaveURL(/sort=6m-ann/);
		await expect(page).not.toHaveURL(/direction=/);
	});

	test('supports sorting by 6M annualised return', async ({ page }) => {
		await page.goto('/trading-view/vaults?returns=1m-ann,3m-ann,6m-ann');
		await openAdvancedSettings(page);
		await page.getByRole('button', { name: /6M return ann\./ }).click();

		await expect(page).toHaveURL(/sort=6m-ann/);
		await expect(page).not.toHaveURL(/direction=/);
		await expect(page.locator('tbody tr.targetable').first()).toContainText('Return leader alpha');
	});

	test('advanced settings controls still update URL state', async ({ page }) => {
		await openAdvancedSettings(page);
		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2C3m-ann%2C6m-ann/);
	});

	test('shows limited data tooltips for partial 3M and 1Y returns', async ({ page }) => {
		await page.goto('/trading-view/vaults?returns=1m-ann,3m-ann,1y-ann');
		const vaultSearch = page.getByTestId('vault-search');
		await vaultSearch.click();
		await vaultSearch.pressSequentially('Limited coverage vault');

		const row = page.locator('tbody tr.targetable').first();
		await expect(row).toContainText('Limited coverage vault');

		await expectLimitedDataTooltip(
			page,
			row.locator('td.return-column-3m-ann .tooltip'),
			'2025-11-15',
			'2026-01-01',
			45
		);
		await expectLimitedDataTooltip(
			page,
			row.locator('td.return-column-1y-ann .tooltip'),
			'2025-05-01',
			'2026-01-01',
			240
		);
	});

	test('shows limited data tooltip for partial 6M returns', async ({ page }) => {
		await page.goto('/trading-view/vaults?returns=1m-ann,3m-ann,6m-ann');
		const vaultSearch = page.getByTestId('vault-search');
		await vaultSearch.click();
		await vaultSearch.pressSequentially('Limited coverage vault');

		const row = page.locator('tbody tr.targetable').first();
		await expect(row).toContainText('Limited coverage vault');

		await expectLimitedDataTooltip(
			page,
			row.locator('td.return-column-6m-ann .tooltip'),
			'2025-09-01',
			'2026-01-01',
			120
		);
	});

	test('displays sparkline images', async ({ page }) => {
		// Wait for first sparkline to be visible
		const firstSparkline = page.locator('td.sparkline img').first();
		await expect(firstSparkline).toBeVisible();
	});

	test('retains URL search params when navigating to vault detail and back', async ({ page }) => {
		const searchParams = { tvl: '1m', sort: 'tvl', direction: 'desc', returns: '1m-ann,6m-ann,lifetime-abs' };

		// Navigate with custom search params
		await page.goto(`/trading-view/vaults?${new URLSearchParams(searchParams)}`);

		// Wait for rows to render
		const rows = page.locator('tbody tr.targetable');
		await expect(rows.first()).toBeVisible();

		// Click the first vault row link to navigate to vault detail
		await page.locator('a.row-link').first().click();
		await page.waitForURL(/\/trading-view\/vaults\/[^/]+$/);

		// Navigate back
		await page.goBack();

		// Verify URL search params are preserved
		await page.waitForURL(urlParamsMatch(searchParams), { timeout: 5000 });
	});
});
