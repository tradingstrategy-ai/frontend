import { expect, test } from '@playwright/test';

test.describe('chain details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/ethereum');
	});

	test('should include chain summary tiles', async ({ page }) => {
		const summary = page.getByTestId('chain-summary');
		for (const title of ['Last indexed block', 'First indexed block', 'Exchanges', 'Trading pairs', 'Tracked vaults']) {
			const tile = summary.getByText(title, { exact: true }).locator('..');
			await expect(tile.locator('h3')).toHaveText(/^[\d,.]+[KMB]?$/);
		}
	});

	test('should load the top exchange and trading pair tables with data', async ({ page }) => {
		for (const [title, type] of [
			['Highest volume exchanges', 'exchanges'],
			['Highest TVL trading pairs', 'trading-pairs']
		]) {
			const box = page.locator('.summary-box').filter({ has: page.getByRole('heading', { name: title }) });
			// five placeholder rows render until the client-side entity request resolves; real rows
			// carry a "View details" link, placeholders do not
			const table = box.locator('table.trading-entities-table');
			await expect(table).not.toHaveClass(/loading/);
			const rows = table.locator('tbody tr.targetable');
			await expect(rows).toHaveCount(5);
			await expect(rows.first().getByRole('link', { name: 'View details' })).toBeAttached();
			await expect(box.getByRole('link', { name: /View all Ethereum/ })).toHaveAttribute(
				'href',
				`/trading-view/ethereum/${type}`
			);
		}
	});
});
