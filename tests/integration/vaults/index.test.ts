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

/** Load every server continuation batch so a control below the table is reachable. */
async function loadAllVaultRows(page: import('@playwright/test').Page) {
	const meta = await page.getByTestId('top-vaults-meta').textContent();
	const expectedRowCount = Number(
		meta
			?.trim()
			.match(/^([\d,]+)/)?.[1]
			.replaceAll(',', '')
	);
	if (!Number.isFinite(expectedRowCount)) throw new Error(`Could not read the vault count from: ${meta}`);

	for (let attempt = 0; attempt < 20; attempt++) {
		const rowCount = await page.locator('tbody tr.targetable').count();
		if (rowCount === expectedRowCount) return;
		await expect
			.poll(async () => {
				await page.evaluate(
					() =>
						new Promise<void>((resolve) => {
							window.scrollTo(0, 0);
							requestAnimationFrame(() =>
								requestAnimationFrame(() => {
									document.querySelector('[data-testid="load-more-sentinel"]')?.scrollIntoView();
									resolve();
								})
							);
						})
				);
				return page.locator('tbody tr.targetable').count();
			})
			.toBeGreaterThan(rowCount);
	}

	await expect(page.locator('tbody tr.targetable')).toHaveCount(expectedRowCount);
}

async function toggleReturnOption(page: import('@playwright/test').Page, label: string) {
	await page.getByTestId('return-columns-menu').getByText(label, { exact: true }).click();
}

function returnColumnsTrigger(page: import('@playwright/test').Page) {
	return page.locator('.filters-content').getByTestId('return-columns-trigger');
}

function filterGroup(page: import('@playwright/test').Page, name: 'display' | 'hide' | 'performance') {
	return page.getByTestId(`filter-group-${name}`);
}

/** Assert that every filter control is available in its intended group. */
async function expectFilterControls(page: import('@playwright/test').Page) {
	const displayGroup = filterGroup(page, 'display');
	const hideGroup = filterGroup(page, 'hide');
	const performanceGroup = filterGroup(page, 'performance');

	for (const [name, group] of [
		['Display', displayGroup],
		['Hide vaults', hideGroup],
		['Performance and risk', performanceGroup]
	] as const) {
		await expect(group).toHaveAccessibleName(name);
		await expect(group.getByRole('heading', { name })).toBeVisible();
	}

	await expect(displayGroup.getByText('Columns', { exact: true })).toBeVisible();
	await expect(returnColumnsTrigger(page)).toBeVisible();
	for (const label of ['Currently closed', 'Unknown protocols', 'AMM', 'Private']) {
		await expect(hideGroup.getByLabel(label, { exact: true })).toBeVisible();
	}
	for (const label of ['Technical risk', 'Min TVL', 'Age', 'Max drawdown', 'Monthly returns', 'Volatility']) {
		await expect(performanceGroup.getByText(label, { exact: true })).toBeVisible();
	}
}

/** Assert the desktop and tablet three-column filter layout. */
async function expectHorizontalFilterLayout(page: import('@playwright/test').Page) {
	const displayGroup = filterGroup(page, 'display');
	const hideGroup = filterGroup(page, 'hide');
	const performanceGroup = filterGroup(page, 'performance');
	const [displayBox, hideBox, performanceBox] = await Promise.all([
		displayGroup.boundingBox(),
		hideGroup.boundingBox(),
		performanceGroup.boundingBox()
	]);

	if (!displayBox || !hideBox || !performanceBox) throw new Error('Expected visible filter groups');

	expect(Math.abs(displayBox.y - hideBox.y)).toBeLessThan(1);
	expect(Math.abs(hideBox.y - performanceBox.y)).toBeLessThan(1);
	expect(displayBox.x).toBeLessThan(hideBox.x);
	expect(hideBox.x).toBeLessThan(performanceBox.x);
	await expect(displayGroup).toHaveCSS('border-left-width', '0px');
	await expect(hideGroup).toHaveCSS('border-left-width', '1px');
	await expect(performanceGroup).toHaveCSS('border-left-width', '1px');
	const hidePadding = await hideGroup.evaluate((element) => {
		const style = getComputedStyle(element);
		return { left: style.paddingLeft, right: style.paddingRight };
	});
	expect(hidePadding.left).toBe(hidePadding.right);
	expect(Number.parseFloat(hidePadding.left)).toBeGreaterThan(0);
	expect(await performanceGroup.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);

	const [closedBox, unknownBox, ammBox, privateBox] = await Promise.all([
		hideGroup.getByLabel('Currently closed', { exact: true }).boundingBox(),
		hideGroup.getByLabel('Unknown protocols', { exact: true }).boundingBox(),
		hideGroup.getByLabel('AMM', { exact: true }).boundingBox(),
		hideGroup.getByLabel('Private', { exact: true }).boundingBox()
	]);
	if (!closedBox || !unknownBox || !ammBox || !privateBox) throw new Error('Expected visible Hide checkboxes');
	expect(closedBox.y).toBeLessThan(unknownBox.y);
	expect(unknownBox.y).toBeLessThan(ammBox.y);
	expect(ammBox.y).toBeLessThan(privateBox.y);
	expect(closedBox.y).toBeLessThan(hideBox.y + hideBox.height / 2);
}

/** Assert the mobile stacked filter layout. */
async function expectStackedFilterLayout(page: import('@playwright/test').Page) {
	const displayGroup = filterGroup(page, 'display');
	const hideGroup = filterGroup(page, 'hide');
	const performanceGroup = filterGroup(page, 'performance');
	const [displayBox, hideBox, performanceBox] = await Promise.all([
		displayGroup.boundingBox(),
		hideGroup.boundingBox(),
		performanceGroup.boundingBox()
	]);

	if (!displayBox || !hideBox || !performanceBox) throw new Error('Expected visible filter groups');
	expect(displayBox.y).toBeLessThan(hideBox.y);
	expect(hideBox.y).toBeLessThan(performanceBox.y);
	await expect(displayGroup).toHaveCSS('border-left-width', '0px');
	await expect(hideGroup).toHaveCSS('border-left-width', '0px');
	await expect(performanceGroup).toHaveCSS('border-left-width', '0px');
}

/** Read the rendered label and dropdown positions for every Performance control. */
async function getPerformanceControlPositions(page: import('@playwright/test').Page) {
	const performanceGroup = filterGroup(page, 'performance');
	const controls = performanceGroup.locator(':scope > .filter-group');
	await expect(performanceGroup).toHaveCSS('display', 'grid');
	await expect(controls).toHaveCount(6);

	return controls.evaluateAll((elements) =>
		elements.map((element) => {
			const label = element.querySelector('.filter-label');
			const dropdown = element.lastElementChild;
			if (!label || !dropdown) throw new Error('Expected a label and dropdown for every Performance control');
			const labelBox = label.getBoundingClientRect();
			const dropdownBox = dropdown.getBoundingClientRect();
			return { labelRight: labelBox.right, dropdownLeft: dropdownBox.left, y: dropdownBox.y };
		})
	);
}

/** Assert that tablet performance controls use aligned label and dropdown columns. */
async function expectTabletPerformanceGrid(page: import('@playwright/test').Page) {
	const rows = await getPerformanceControlPositions(page);

	for (let index = 1; index < rows.length; index++) {
		expect(rows[index].y).toBeGreaterThan(rows[index - 1].y);
		expect(Math.abs(rows[index].labelRight - rows[0].labelRight)).toBeLessThan(1);
		expect(Math.abs(rows[index].dropdownLeft - rows[0].dropdownLeft)).toBeLessThan(1);
	}
}

/** Assert that desktop performance controls use three aligned label/dropdown pairs per row. */
async function expectDesktopPerformanceGrid(page: import('@playwright/test').Page) {
	const rows = await getPerformanceControlPositions(page);

	for (let column = 0; column < 3; column++) {
		expect(Math.abs(rows[column].y - rows[0].y)).toBeLessThan(1);
		expect(Math.abs(rows[column + 3].y - rows[3].y)).toBeLessThan(1);
		expect(rows[column + 3].y).toBeGreaterThan(rows[column].y);
		expect(Math.abs(rows[column + 3].labelRight - rows[column].labelRight)).toBeLessThan(1);
		expect(Math.abs(rows[column + 3].dropdownLeft - rows[column].dropdownLeft)).toBeLessThan(1);
	}
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

	test('groups all controls in a collapsed Filters disclosure on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		const displayGroup = filterGroup(page, 'display');
		await expect(displayGroup).not.toBeVisible();

		const filters = page.getByTestId('vault-filters');
		await expect(filters).not.toHaveAttribute('open', '');
		const filtersSummary = page.getByTestId('filters-summary');
		await expect(filtersSummary).toHaveText('Filters');
		await expect(filtersSummary.locator('svg').nth(0)).toHaveClass(/settings/);
		await expect(filtersSummary.locator('svg').nth(1)).toHaveClass(/chevron-down/);
		await expect(page.getByTestId('return-columns-trigger')).not.toBeVisible();
		await expect(page.locator('.filters-content').getByText('Min TVL')).not.toBeVisible();

		await openFilters(page);

		await expectFilterControls(page);
		await expectHorizontalFilterLayout(page);
		await expectDesktopPerformanceGrid(page);
		await expect(page.getByText('Hide currently closed', { exact: true })).toHaveCount(0);
		await expect(page.getByText('Hide unknown protocols', { exact: true })).toHaveCount(0);
		await expect(page.getByText('Hide private', { exact: true })).toHaveCount(0);
		await expect(returnColumnsTrigger(page)).toBeVisible();
		await expect(page.getByTestId('filters-note')).toBeVisible();
		await expect(page.getByTestId('filters-note')).toContainText(
			'The vaults on the listing are limited to the current category. See all vaults.'
		);
		await expect(page.getByTestId('filters-note').getByRole('link', { name: 'See all vaults.' })).toHaveAttribute(
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
		await expect(filterGroup(page, 'performance').getByText('Technical risk', { exact: true })).toBeVisible();
	});

	test('lays out filter groups horizontally with dividers at tablet widths', async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 900 });
		await page.goto('/vaults');
		await openFilters(page);

		await expectFilterControls(page);
		await expectHorizontalFilterLayout(page);
		await expectTabletPerformanceGrid(page);
	});

	test('omits the Unknown protocols checkbox on protocol listings', async ({ page }) => {
		await page.goto('/vaults/protocols/apex');
		await openFilters(page);

		await expect(filterGroup(page, 'hide').getByLabel('Unknown protocols', { exact: true })).toHaveCount(0);
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
		const displayGroup = filterGroup(page, 'display');
		const hideGroup = filterGroup(page, 'hide');
		const performanceGroup = filterGroup(page, 'performance');
		const filters = page.getByTestId('vault-filters');

		await expect(mobileFiltersTrigger).toBeVisible();
		await expect(mobileFiltersTrigger).toHaveAttribute('aria-expanded', 'false');
		await expect(displayGroup).not.toBeVisible();
		await expect(filters).not.toBeVisible();

		await mobileFiltersTrigger.click();

		await expect(mobileFiltersTrigger).toHaveAttribute('aria-expanded', 'true');
		await expect(displayGroup).toBeVisible();
		await expect(hideGroup).toBeVisible();
		await expect(performanceGroup).toBeVisible();
		await expectFilterControls(page);
		await expect(page.getByTestId('filters-summary')).not.toBeVisible();
		await expectStackedFilterLayout(page);
	});

	test('closes the mobile Filters disclosure', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults');

		const mobileFiltersTrigger = page.getByTestId('mobile-filters-trigger');
		await mobileFiltersTrigger.click();
		await expect(filterGroup(page, 'performance')).toBeVisible();

		await mobileFiltersTrigger.click();
		await expect(mobileFiltersTrigger).toHaveAttribute('aria-expanded', 'false');
		await expect(filterGroup(page, 'performance')).not.toBeVisible();
	});

	test('opens mobile Filters from the saved preference', async ({ page }) => {
		await page.evaluate(() => window.localStorage.setItem('top-vaults-filters-open', 'true'));
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/vaults');

		await expect(page.getByTestId('mobile-filters-trigger')).toHaveAttribute('aria-expanded', 'true');
		await expect(filterGroup(page, 'performance')).toBeVisible();
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
		await expect(page.getByTestId('top-vaults-meta')).toContainText('258 vaults');
		await expect(page.locator('tbody tr.targetable')).toHaveCount(258);
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
		await expect(page.getByTestId('top-vaults-meta')).toContainText('259 vaults');
		await expect(page.locator('tbody tr.targetable')).toHaveCount(259);
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(scrollBefore - 200);
		expect(documentNavigationUrl).toBeUndefined();
	});

	test('clears revealed blacklisted rows after a server-loaded sort navigation', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await loadAllVaultRows(page);

		await page.getByTestId('show-blacklisted-vaults').click();
		await expect(page.locator('tbody tr.targetable')).toHaveCount(259);

		await page.locator('th.vault button').click();
		await expect(page).toHaveURL(/sort=vault/);
		await loadAllVaultRows(page);

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(259);
		await expect(rows.filter({ hasText: 'atvPTmax' })).toHaveCount(1);
	});

	test('ignores a continuation response from the listing before navigation', async ({ page }) => {
		let releaseResponse!: () => void;
		let markRequestStarted!: () => void;
		const responseReleased = new Promise<void>((resolve) => (releaseResponse = resolve));
		const requestStarted = new Promise<void>((resolve) => (markRequestStarted = resolve));

		await page.route('**/top-vaults/listing-data?**', async (route) => {
			const requestUrl = new URL(route.request().url());
			if (requestUrl.searchParams.get('offset') !== '125' || requestUrl.searchParams.has('sort')) {
				await route.continue();
				return;
			}

			const upstream = await route.fetch();
			const payload = await upstream.json();
			markRequestStarted();
			await responseReleased;
			await route.fulfill({
				response: upstream,
				headers: { ...upstream.headers(), 'x-stale-continuation': '1' },
				json: {
					...payload,
					vaults: payload.vaults.map((vault: Record<string, unknown>, index: number) => ({
						...vault,
						name: `Stale continuation ${index}`
					}))
				}
			});
		});

		await page.getByTestId('load-more-sentinel').scrollIntoViewIfNeeded();
		await requestStarted;
		await page.locator('th.vault button').click();
		await expect(page).toHaveURL(/sort=vault/);

		const staleResponse = page.waitForResponse((response) => response.headers()['x-stale-continuation'] === '1');
		releaseResponse();
		await staleResponse;
		await page.evaluate(
			() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
		);
		await expect(page.locator('tbody tr.targetable').filter({ hasText: 'Stale continuation' })).toHaveCount(0);
	});

	test('reveals the complete broader risk population from a narrower filter', async ({ page }) => {
		await page.goto('/vaults?risk=5');
		await loadAllVaultRows(page);
		await expect(page.locator('tbody tr.targetable').filter({ hasText: 'Above TVL 009' })).toHaveCount(0);

		await page.getByTestId('show-blacklisted-vaults').click();
		await expect(page.getByTestId('top-vaults-meta')).toContainText('259 vaults');
		await loadAllVaultRows(page);

		await expect(page.locator('tbody tr.targetable').filter({ hasText: 'Above TVL 009' })).toHaveCount(1);
		await expect(page.locator('tbody tr.targetable')).toHaveCount(259, { timeout: 15_000 });
	});

	test('continues a blacklisted reveal when the original listing fits in one server page', async ({ page }) => {
		let templateVault: Record<string, unknown> | undefined;
		let revealRequestCount = 0;

		await page.route('**/top-vaults/listing-data?**', async (route) => {
			const requestUrl = new URL(route.request().url());
			if (requestUrl.searchParams.get('risk') !== '0') {
				await route.continue();
				return;
			}

			const upstream = await route.fetch();
			const payload = await upstream.json();
			templateVault ??= payload.vaults[0];
			if (!templateVault) throw new Error('Expected a blacklisted high-TVL fixture');

			const offset = Number(requestUrl.searchParams.get('offset') ?? '0');
			const batchSize = offset === 0 ? 50 : 1;
			const vaults = Array.from({ length: batchSize }, (_, index) => ({
				...templateVault,
				id: `pagination-blacklisted-${offset + index}`,
				name: `Pagination blacklisted ${String(offset + index).padStart(2, '0')}`,
				vault_slug: `pagination-blacklisted-${offset + index}`,
				risk: 'Blacklisted',
				risk_numeric: 999
			}));
			revealRequestCount++;

			await route.fulfill({
				response: upstream,
				json: {
					...payload,
					vaults,
					nextOffset: offset + vaults.length,
					hasMore: offset + vaults.length < 51,
					listingSummary: payload.listingSummary
				}
			});
		});

		await page.goto('/vaults/high-tvl');
		await page.getByTestId('show-blacklisted-vaults').click();

		const paginationRows = page.locator('tbody tr.targetable').filter({ hasText: 'Pagination blacklisted' });
		await expect(paginationRows).toHaveCount(50);
		const sentinel = page.getByTestId('load-more-sentinel');
		await expect(sentinel).toBeVisible();
		await expect(paginationRows).toHaveCount(51);
		await expect(sentinel).toHaveCount(0);
		expect(revealRequestCount).toBe(2);
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
			'This ranking contains vaults whose deposits are permissioned or restricted by an allowlist.'
		);
	});

	test('displays vault count in table meta', async ({ page }) => {
		const meta = page.getByTestId('top-vaults-meta');
		// Should show 258 vaults (those above TVL threshold)
		await expect(meta).toContainText('258 vaults');
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

	test('loads 500 vaults through server continuation requests', async ({ page }) => {
		await page.goto('/vaults?tvl=any&q=Continuation%20vault');

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

		// The final continuation contains the remaining 33 rows.
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(258);

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
		await page.goto('/vaults?q=Return%20leader');
		await openFilters(page);
		const currentlyClosed = filterGroup(page, 'hide').getByLabel('Currently closed', { exact: true });
		await currentlyClosed.check();
		await expect(page).toHaveURL(/closed=1/);
		await currentlyClosed.uncheck();
		await expect(page).not.toHaveURL(/closed=/);

		const volatilityFilter = filterGroup(page, 'performance')
			.locator('.filter-group')
			.filter({ hasText: 'Volatility' });
		await volatilityFilter.getByRole('button', { name: 'Any' }).click();
		const volatilityOptions = volatilityFilter.locator('.tvl-options');
		for (const option of ['Any', 'Less than 5%', 'Less than 10%', 'Less than 25%', 'Less than 50%']) {
			await expect(volatilityOptions.getByRole('button', { name: option, exact: true })).toBeVisible();
		}
		await volatilityOptions.getByRole('button', { name: 'Less than 10%' }).click();
		await expect(page).toHaveURL(/vol=10/);
		await expect(page.locator('tbody tr.targetable')).toHaveCount(1);
		await expect(page.locator('tbody tr.targetable')).toContainText('Return leader alpha');

		await returnColumnsTrigger(page).click();
		await toggleReturnOption(page, 'Six months annualised');

		await expect(page).toHaveURL(/returns=1m-ann%2C3m-ann%2C6m-ann/);
	});

	test('hides all permissioned vaults when the private filter is selected', async ({ page }) => {
		await page.goto('/vaults/all?q=Private');
		await openFilters(page);

		const privateFilter = filterGroup(page, 'hide').getByLabel('Private', { exact: true });
		await privateFilter.check();

		await expect(page).toHaveURL(/private=1/);
		await expect(page.locator('tbody tr.targetable')).toHaveCount(0);
	});

	test('hides AMM-like vaults by default and explains the AMM filter', async ({ page }) => {
		await page.goto('/vaults/all?q=GMX');
		await expect(page.locator('tbody tr.targetable')).toHaveCount(0);

		await page.goto('/vaults');
		await openFilters(page);

		const ammFilter = filterGroup(page, 'hide').getByLabel('AMM', { exact: true });
		await expect(ammFilter).toBeChecked();
		await ammFilter.hover();
		await expect(
			page.getByText('Hide AMM pools and AMM-like vaults with direct exposure to underlying assets.', { exact: true })
		).toBeVisible();
		await expect(page.getByRole('link', { name: 'What is AMM?' })).toHaveAttribute('href', '/glossary/amm');
		await ammFilter.uncheck();
		await expect(page).toHaveURL(/amm=0/);

		await page.goto('/vaults/all?q=GMX&amm=0');
		await expect(page.locator('tbody tr.targetable')).toContainText('GMX USDC pool');
	});

	test('does not offer the private filter on the whitelisted-vault listing', async ({ page }) => {
		await page.goto('/vaults/whitelisted');
		await openFilters(page);

		await expect(filterGroup(page, 'hide').getByLabel('Private', { exact: true })).toHaveCount(0);
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
