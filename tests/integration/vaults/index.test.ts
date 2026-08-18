import { expect, test } from '@playwright/test';

/** Check that a URL contains all expected search param key/value pairs */
function urlParamsMatch(expected: Record<string, string>) {
	return (url: URL) => Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value);
}

async function openFilters(page: import('@playwright/test').Page) {
	await expect(page.locator('tbody tr.targetable').first()).toBeVisible();
	const filters = page.getByTestId('vault-filters');
	if (!(await filters.evaluate((details: HTMLDetailsElement) => details.open))) {
		await page.getByTestId('filters-summary').click();
	}
	await expect(filters).toHaveJSProperty('open', true);
	await expect(page.locator('.filters-content')).toBeVisible();
}

async function closeFilters(page: import('@playwright/test').Page) {
	const filters = page.getByTestId('vault-filters');
	await page.getByTestId('filters-summary').click();
	await expect(filters).toHaveJSProperty('open', false);
}

/** Load additional listing rows until a named vault is rendered. */
async function getVaultRow(page: import('@playwright/test').Page, name: string) {
	await expect(page.locator('tbody tr.targetable').first()).toBeVisible();
	const row = page.locator('tbody tr.targetable').filter({ hasText: name });
	for (let attempt = 0; attempt < 3 && (await row.count()) === 0; attempt++) {
		const sentinel = page.getByTestId('load-more-sentinel');
		if (!(await sentinel.isVisible())) break;
		const previousRowCount = await page.locator('tbody tr.targetable').count();
		await sentinel.scrollIntoViewIfNeeded();
		await expect.poll(() => page.locator('tbody tr.targetable').count()).toBeGreaterThan(previousRowCount);
	}
	await expect(row).toHaveCount(1);
	return row;
}

/** Load every progressive batch so a control below the table is reachable. */
async function loadAllVaultRows(page: import('@playwright/test').Page) {
	for (let attempt = 0; attempt < 10; attempt++) {
		const sentinel = page.getByTestId('load-more-sentinel');
		if ((await sentinel.count()) === 0) return;

		const rowCount = await page.locator('tbody tr.targetable').count();
		await sentinel.scrollIntoViewIfNeeded();
		await expect.poll(() => page.locator('tbody tr.targetable').count()).toBeGreaterThan(rowCount);
	}

	await expect(page.getByTestId('load-more-sentinel')).toHaveCount(0);
}

async function toggleReturnOption(page: import('@playwright/test').Page, label: string) {
	await page.getByTestId('return-columns-menu').getByText(label, { exact: true }).click();
}

function returnColumnsTrigger(page: import('@playwright/test').Page) {
	return page.locator('.filters-content').getByTestId('return-columns-trigger');
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
		await page.goto('/vaults');
	});

	test('shows the default return columns', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Top stablecoin vaults' })).toBeVisible();

		const header = page.locator('thead');
		await expect(header).toContainText(/1M\s*return ann\./);
		await expect(header).toContainText(/3M\s*return ann\./);
		await expect(header).toContainText(/Lifetime\s*return abs\./);
	});

	test('describes the default return ranking', async ({ page }) => {
		await expect(page.locator('.hero-banner .subtitle')).toHaveText(
			'The best-performing stablecoin vaults. Ranked by 30-day returns. Table headers and filters offer more criteria.'
		);
	});

	test('updates the ranking description when the table sort changes', async ({ page }) => {
		await page.locator('th.tvl button').click();

		await expect(page).toHaveURL(/sort=tvl/);
		await expect(page.locator('.hero-banner .subtitle')).toHaveText(
			'The best-performing stablecoin vaults. Ranked by total value locked. Table headers and filters offer more criteria.'
		);
	});

	test('shows lifetime data tooltip on the lifetime return cell', async ({ page }) => {
		const row = await getVaultRow(page, 'Trading Strategy ICHIv3 LS 2');

		await expectLifetimeDataTooltip(
			row.locator('td.return-column-lifetime-abs .tooltip'),
			'2025-01-01',
			'2026-01-01',
			365
		);
	});

	test('groups all controls in a collapsed Filters disclosure', async ({ page }) => {
		const primaryFilters = page.locator('.primary-filters');
		await expect(primaryFilters).not.toBeVisible();

		const filters = page.getByTestId('vault-filters');
		await expect(filters).not.toHaveAttribute('open', '');
		await expect(page.getByTestId('filters-summary')).toHaveText('Filters');
		await expect(page.getByTestId('return-columns-trigger')).not.toBeVisible();
		await expect(page.locator('.filters-content').getByText('Min TVL')).not.toBeVisible();

		await openFilters(page);

		await expect(primaryFilters.getByText('Technical risk', { exact: true })).toBeVisible();
		await expect(primaryFilters.getByText('Hide undepositable', { exact: true })).toBeVisible();
		await expect(primaryFilters.getByTestId('vault-search')).toHaveCount(0);
		await expect(page.locator('.filters-content').getByText('Min TVL')).toBeVisible();
		await expect(page.locator('.filters-content').getByText('Age', { exact: true })).toBeVisible();
		await expect(page.locator('.filters-content').getByText('Max drawdown')).toBeVisible();
		await expect(returnColumnsTrigger(page)).toBeVisible();
		await expect(page.getByTestId('filters-note')).toBeVisible();
		await expect(page.getByTestId('filters-note')).toContainText(
			'All vaults page allows you to filter over everything. The vaults on this page are limited to the current category.'
		);
		await expect(page.getByTestId('filters-note').getByRole('link', { name: 'All vaults page' })).toHaveAttribute(
			'href',
			'/vaults/all'
		);

		await closeFilters(page);
		await expect(filters).not.toHaveAttribute('open', '');
		await expect(returnColumnsTrigger(page)).not.toBeVisible();
	});

	test('keeps Filters open while moving between vault listings', async ({ page }) => {
		await openFilters(page);

		await page.goto('/vaults/all');
		await expect(page.getByTestId('vault-filters')).toHaveAttribute('open', '');
	});

	test('opens Filters for URLs with filter parameters', async ({ page }) => {
		await page.goto('/vaults?risk=2');

		await expect(page.getByTestId('vault-filters')).toHaveAttribute('open', '');
		await expect(page.locator('.primary-filters').getByText('Technical risk', { exact: true })).toBeVisible();
	});

	test('keeps Filters closed after updating a filtered listing', async ({ page }) => {
		await page.goto('/vaults?risk=2');
		await closeFilters(page);

		await page.locator('th.vault button').click();
		await expect(page.getByTestId('vault-filters')).not.toHaveAttribute('open', '');

		await page.goto('/vaults/all');
		await expect(page.getByTestId('vault-filters')).not.toHaveAttribute('open', '');
	});

	test('groups all filters under a mobile Filters disclosure', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults');

		const mobileFiltersTrigger = page.getByTestId('mobile-filters-trigger');
		const primaryFilters = page.locator('.primary-filters');
		const filters = page.getByTestId('vault-filters');

		await expect(mobileFiltersTrigger).toBeVisible();
		await expect(mobileFiltersTrigger).toHaveAttribute('aria-expanded', 'false');
		await expect(primaryFilters).not.toBeVisible();
		await expect(filters).not.toBeVisible();

		await mobileFiltersTrigger.click();

		await expect(mobileFiltersTrigger).toHaveAttribute('aria-expanded', 'true');
		await expect(primaryFilters.getByText('Technical risk', { exact: true })).toBeVisible();
		await expect(primaryFilters.getByTestId('vault-search')).toHaveCount(0);
		await expect(page.locator('.filters-content').getByText('Min TVL')).toBeVisible();
		await expect(page.getByTestId('filters-summary')).not.toBeVisible();
	});

	test('closes the mobile Filters disclosure', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults');

		const mobileFiltersTrigger = page.getByTestId('mobile-filters-trigger');
		await mobileFiltersTrigger.click();
		await expect(page.locator('.primary-filters')).toBeVisible();

		await mobileFiltersTrigger.click();
		await expect(mobileFiltersTrigger).toHaveAttribute('aria-expanded', 'false');
		await expect(page.locator('.primary-filters')).not.toBeVisible();
	});

	test('opens mobile Filters from the saved preference', async ({ page }) => {
		await page.evaluate(() => window.localStorage.setItem('top-vaults-filters-open', 'true'));
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults');

		await expect(page.getByTestId('mobile-filters-trigger')).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('.primary-filters')).toBeVisible();
	});

	test('constrains and wraps vault labels on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults');

		const vaultCell = page.locator('td.vault').first();
		const vaultLabel = vaultCell.locator('.multiline > *').first();

		const vaultCellWidth = await vaultCell.evaluate((element) => element.getBoundingClientRect().width);
		expect(vaultCellWidth).toBeLessThanOrEqual(170);
		await expect(vaultLabel).toHaveCSS('overflow-wrap', 'anywhere');
	});

	test('hides the all-vaults note on the all vaults page', async ({ page }) => {
		await page.goto('/vaults/all');
		await openFilters(page);
		await expect(page.getByTestId('filters-note')).toHaveCount(0);
	});

	test('defaults the all-vaults listing to Dangerous technical risk', async ({ page }) => {
		await page.goto('/vaults/all');
		await openFilters(page);
		await expect(page.locator('.filter-group:has-text("Technical risk") .tvl-trigger')).toHaveText('Dangerous');
	});

	test('shows blacklisted-only vaults sorted by TVL by default', async ({ page }) => {
		await page.goto('/vaults/blacklisted');

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(3);
		await expect(rows.first()).toContainText('Abnormal TVL blacklisted vault');
		await expect(rows.first()).not.toHaveClass(/blacklisted/);
		await expect(rows.first().locator('td').first()).toHaveCSS('text-decoration-line', 'none');
		await expect(rows.nth(1)).toContainText('atvPTmax');
		await expect(rows.nth(2)).toContainText('Morpho flagged blacklisted vault');
		await expect(
			page.getByText(/Blacklisted 3 vaults and \$8M TVL \(some of this TVL is likely to be fake\)\./)
		).toBeVisible();
		await expect(
			page.getByText(
				'Blacklisting reasons include illiquidity, depegging of the denominating fiat token, being a subvault of a composite, and suspicious activities.'
			)
		).toBeVisible();
		await expect(page.getByTestId('top-vaults-meta')).toContainText('3 vaults out of');
		await expect(page.getByTestId('top-vaults-meta')).toContainText('TVL $8M');
		await expect(page.getByTestId('top-vaults-meta')).toContainText('Avg. return 20.00%');
	});

	test('reveals blacklisted vaults while preserving the scroll position', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/vaults');
		await loadAllVaultRows(page);

		const revealButton = page.getByTestId('show-blacklisted-vaults');
		await expect(revealButton).toHaveText(/Show \d+ blacklisted vaults?/);
		await expect(page.getByTestId('top-vaults-meta')).toContainText('254 vaults');
		await expect(page.locator('tbody tr.targetable')).toHaveCount(254);
		await revealButton.scrollIntoViewIfNeeded();

		const scrollBefore = await page.evaluate(() => window.scrollY);
		expect(scrollBefore).toBeGreaterThan(0);
		let documentNavigationUrl: string | undefined;
		page.on('request', (request) => {
			if (request.isNavigationRequest() && request.url().includes('risk=0')) {
				documentNavigationUrl = request.url();
			}
		});
		await revealButton.click();

		await expect.poll(() => new URL(page.url()).searchParams.get('risk')).toBe('0');
		await expect(page.getByTestId('show-blacklisted-vaults')).toHaveCount(0);
		await expect(page.getByTestId('top-vaults-meta')).toContainText('255 vaults');
		await expect(page.locator('tbody tr.targetable')).toHaveCount(255);
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(scrollBefore - 200);
		expect(documentNavigationUrl).toBeUndefined();
	});

	test('shows only whitelisted vaults', async ({ page }) => {
		await page.goto('/vaults/whitelisted');

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(2);
		await expect(rows.filter({ hasText: 'Private vault' })).toHaveCount(1);
		await expect(rows.locator('td.lockup').filter({ hasText: 'Private' })).toHaveCount(1);
		await expect(rows.locator('td.lockup').filter({ hasText: 'Fund' })).toHaveCount(1);
		await expect(page.locator('h1')).toHaveText('Whitelisted stablecoin vaults');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'This ranking contains only vaults that are not open to public and have some sort of permissioned deposits.'
		);
	});

	test('displays vault count in table meta', async ({ page }) => {
		const meta = page.getByTestId('top-vaults-meta');
		// Should show 254 vaults (those above TVL threshold)
		await expect(meta).toContainText('254 vaults');
	});

	test('renders an initial batch of more than 100 rows', async ({ page }) => {
		const rows = page.locator('tbody tr.targetable');
		// Wait for rows to be visible
		await expect(rows.first()).toBeVisible();
		await expect(rows).toHaveCount(125);
	});

	test('shows load-more sentinel when more rows available', async ({ page }) => {
		const sentinel = page.getByTestId('load-more-sentinel');
		await expect(sentinel).toBeVisible();
		await expect(sentinel).toContainText(/Loading more vaults/);
	});

	test('uses the full server-side listing summary for the average return', async ({ page }) => {
		await page.goto('/vaults?tvl=any&q=Summary%20regression&unknown=0');

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(125);
		await expect(page.getByTestId('top-vaults-meta')).toContainText('151 vaults');
		await expect(page.getByTestId('top-vaults-meta')).toContainText('Avg. return 76.61%');
	});

	test('loads 50 more rows when scrolling to sentinel', async ({ page }) => {
		// Check initial row count
		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(125);

		// Scroll the sentinel into view
		const sentinel = page.getByTestId('load-more-sentinel');
		await sentinel.scrollIntoViewIfNeeded();

		// Confirm additional rows
		await expect(rows).toHaveCount(175);
	});

	test('loads 500 vaults through progressive scrolling', async ({ page }) => {
		await page.goto('/vaults?tvl=any&q=Progressive%20scroll%20vault');

		const rows = page.locator('tbody tr.targetable');
		const sentinel = page.getByTestId('load-more-sentinel');
		await expect(rows).toHaveCount(125);

		for (let expectedCount = 175; expectedCount < 500; expectedCount += 50) {
			await sentinel.scrollIntoViewIfNeeded();
			await expect(rows).toHaveCount(expectedCount);
		}
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(500);

		await expect(sentinel).not.toBeVisible();
	});

	test('sentinel disappears when all rows loaded', async ({ page }) => {
		const rows = page.locator('tbody tr.targetable');
		const sentinel = page.getByTestId('load-more-sentinel');

		// scroll once - loads additional 50
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(175);

		// Scroll again - loads another full batch.
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(225);

		// The final continuation contains the remaining 29 rows.
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(254);

		// All rows loaded - no more sentinel.
		await expect(sentinel).not.toBeVisible();
	});

	test('applies text searches from the URL', async ({ page }) => {
		await page.goto('/vaults?q=Above%20TVL%20042');
		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(1);
	});

	test('selecting a fourth return column evicts the current third selection', async ({ page }) => {
		await openFilters(page);
		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2C3m-ann%2C6m-ann/);
		await expect(page.locator('thead')).toContainText(/6M\s*return ann\./);
		await expect(page.locator('thead')).not.toContainText(/Lifetime\s*return abs\./);
	});

	test('removing the active return sort resets sorting to the first visible return column', async ({ page }) => {
		await page.goto('/vaults?returns=1m-ann,6m-ann,lifetime-abs&sort=6m-ann&direction=asc');
		await expect(page).toHaveURL(/sort=6m-ann/);

		await openFilters(page);
		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2Clifetime-abs/);
		await expect(page).not.toHaveURL(/sort=6m-ann/);
		await expect(page).not.toHaveURL(/direction=/);
	});

	test('supports sorting by 6M annualised return', async ({ page }) => {
		await page.goto('/vaults?returns=1m-ann,3m-ann,6m-ann');
		await openFilters(page);
		await page.getByRole('button', { name: /6M return ann\./ }).click();

		await expect(page).toHaveURL(/sort=6m-ann/);
		await expect(page).not.toHaveURL(/direction=/);
		await expect(page.locator('tbody tr.targetable').first()).toContainText('Return leader alpha');
	});

	test('Filters controls update URL state', async ({ page }) => {
		await openFilters(page);
		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2C3m-ann%2C6m-ann/);
	});

	test('shows limited data tooltips for partial 3M and 1Y returns', async ({ page }) => {
		await page.goto('/vaults?returns=1m-ann,3m-ann,1y-ann&unknown=0');
		const row = await getVaultRow(page, 'Limited coverage vault');

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
		await page.goto('/vaults?returns=1m-ann,3m-ann,6m-ann&unknown=0');
		const row = await getVaultRow(page, 'Limited coverage vault');

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
		await page.goto(`/vaults?${new URLSearchParams(searchParams)}`);

		// Wait for rows to render
		const rows = page.locator('tbody tr.targetable');
		await expect(rows.first()).toBeVisible();

		// Click the first vault row link to navigate to vault detail
		await page.locator('a.row-link').first().click();
		await page.waitForURL(/\/vaults\/[^/]+$/);

		// Navigate back
		await page.goBack();

		// Verify URL search params are preserved
		await page.waitForURL(urlParamsMatch(searchParams), { timeout: 5000 });
	});

	test('does not duplicate generated Morpho risk notes on vault detail pages', async ({ page }) => {
		await page.goto('/vaults/morpho-flagged-blacklisted-vault');

		const alerts = page.locator('.alert-list');
		await expect(alerts).toHaveCount(1);
		await expect(alerts.first()).toHaveClass(/error/);
		await expect(alerts.first()).toContainText('Morpho has flagged this vault');
		await expect(alerts.first()).toContainText('bad_debt_unrealized');
		await expect(page.locator('.notes')).toHaveCount(0);
	});

	test('hides detail header actions on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/vaults/morpho-flagged-blacklisted-vault');

		await expect(page.locator('.cta-actions')).toBeHidden();
	});

	test('explains the tokenised fund structure when deposits may be disabled on a vault detail page', async ({
		page
	}) => {
		await page.goto('/vaults/deposit-disabled-vault');

		const alert = page.locator('.alert-list.info').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('Deposit disabled vault is a tokenised fund');
	});

	test('does not show deposits as open when a vault capacity is reached', async ({ page }) => {
		await page.goto('/vaults/deposit-cap-reached-vault');

		const transactionStatus = page.locator('.transaction-status');
		await expect(transactionStatus).toContainText('Deposits Capped');
		await expect(transactionStatus).not.toContainText('Deposits Open');
	});

	test('warns when withdrawals may be disabled on a vault detail page', async ({ page }) => {
		await page.goto('/vaults/withdrawal-disabled-vault');

		const alert = page.locator('.alert-list.warning').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('Withdrawals may be disabled for this vault');
	});

	test('warns when deposits and withdrawals may be disabled on a vault detail page', async ({ page }) => {
		await page.goto('/vaults/deposit-and-withdrawal-disabled-vault');

		const alert = page.locator('.alert-list.warning').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('Deposits and withdrawals may be disabled for this vault');
	});

	test('retains a withdrawal warning when a vault deposit cap is reached', async ({ page }) => {
		await page.goto('/vaults/capped-and-withdrawal-disabled-vault');

		const alert = page.locator('.alert-list.warning').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('Deposits are capped and withdrawals may be disabled for this vault');
	});

	test('marks private vaults and explains their whitelist status', async ({ page }) => {
		await page.goto('/vaults/all?q=Private%20vault');

		const cell = page.locator('tbody tr.targetable').filter({ hasText: 'Private vault' }).locator('td.lockup');
		await expect(cell).toContainText('Private');
		await expect(cell).not.toContainText('Unknown');
		const tooltip = cell.locator('.tooltip');
		await tooltip.hover();
		await expect(tooltip.locator('.popup')).toContainText('This vault does not accept public deposits.');

		await page.goto('/vaults/private-vault');
		await expect(page.locator('.alert-list.warning').first()).toContainText(
			'This is a permissioned vault and is not accepting deposits from outsiders'
		);
		const technicalDetails = page.getByText('Whitelist status', { exact: true }).locator('..');
		await expect(technicalDetails).toContainText('Whitelisted');
		await expect(page.getByText('Whitelist notes', { exact: true }).locator('..')).toContainText(
			'Whitelist checks are handled by the vault'
		);

		await page.goto('/vaults/all?q=Private%20tokenised%20fund');
		const fundCell = page
			.locator('tbody tr.targetable')
			.filter({ hasText: 'Private tokenised fund' })
			.locator('td.lockup');
		await expect(fundCell).toContainText('Fund');
		await expect(fundCell).not.toContainText('Private');
		await expect(fundCell).not.toContainText('Unknown');
	});

	test('shows capped instead of an unknown deposit delay when a vault has reached its cap', async ({ page }) => {
		await page.goto('/vaults/all?q=Deposit%20cap%20reached%20vault');

		const cell = page
			.locator('tbody tr.targetable')
			.filter({ hasText: 'Deposit cap reached vault' })
			.locator('td.lockup');
		await expect(cell).toContainText('Capped');
		await expect(cell).not.toContainText('Unknown');
	});

	test('shows the tokenised-fund disclaimer instead of the permissioned warning', async ({ page }) => {
		await page.goto('/vaults/private-tokenised-fund');
		await expect(page.locator('.notification-stack .alert-list.info')).toContainText(
			'Private tokenised fund is a tokenised fund'
		);
		await expect(page.locator('.notification-stack .alert-list.warning')).toHaveCount(0);
	});
});
