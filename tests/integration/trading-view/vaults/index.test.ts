import { expect, test } from '@playwright/test';

/** Check that a URL contains all expected search param key/value pairs */
function urlParamsMatch(expected: Record<string, string>) {
	return (url: URL) => Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value);
}

test.describe('vault index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults');
	});

	test('displays vault count in table meta', async ({ page }) => {
		const meta = page.getByTestId('top-vaults-meta');
		// Should show 253 vaults (those above TVL threshold)
		await expect(meta).toContainText('253 vaults');
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

		// scroll a third time - loads the final 3
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(253);

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

	test('displays sparkline images', async ({ page }) => {
		// Wait for first sparkline to be visible
		const firstSparkline = page.locator('td.sparkline img').first();
		await expect(firstSparkline).toBeVisible();
	});

	test('retains URL search params when navigating to vault detail and back', async ({ page }) => {
		const searchParams = { tvl: '1m', sort: 'tvl', direction: 'desc' };

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
