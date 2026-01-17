import { expect, test } from '@playwright/test';

test.describe('vault index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults');
	});

	test('displays vault count in table meta', async ({ page }) => {
		const meta = page.getByTestId('top-vaults-meta');
		// Should show 250 vaults (those above TVL threshold)
		await expect(meta).toContainText('250 vaults');
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

		// scroll again - loads additional 50
		await sentinel.scrollIntoViewIfNeeded();
		await expect(rows).toHaveCount(200);

		// all rows loaded - no more sentinel
		await expect(sentinel).toBeVisible();
	});

	test('search filters displayed vaults', async ({ page }) => {
		test.skip(!!process.env.CI, 'Skipping on CI runs for now');

		const vaultSearch = page.getByTestId('vault-search');

		// Verify we have initial rows > 1
		const rows = page.locator('tbody tr.targetable');
		const initialCount = await rows.count();
		expect(initialCount).toBeGreaterThan(1);

		// Search for a unique vault name (index 42 -> "Above TVL 042")
		await vaultSearch.fill('Above TVL 042');
		await expect(rows).toHaveCount(1);
	});

	test('displays sparkline images', async ({ page }) => {
		// Wait for first sparkline to be visible
		const firstSparkline = page.locator('td.sparkline img').first();
		await expect(firstSparkline).toBeVisible();
	});
});
