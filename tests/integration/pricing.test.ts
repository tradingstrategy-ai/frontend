import { expect, test } from '@playwright/test';

test.describe('pricing page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/pricing');
	});

	test('renders with correct title', async ({ page }) => {
		await expect(page).toHaveTitle('Vault data pricing');
	});

	test('shows Free and Pro tier cards', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
	});

	test('Pro tier shows $199/month price', async ({ page }) => {
		await expect(page.getByText('$199/month')).toBeVisible();
	});

	test('Subscribe button links to pricing checkout', async ({ page }) => {
		const btn = page.getByRole('link', { name: 'Subscribe' });
		await expect(btn).toBeVisible();
		const href = await btn.getAttribute('href');
		expect(href).toContain('https://www.marketsoftware.co/');
	});

	test('Download button navigates to vault datasets page', async ({ page }) => {
		await page.getByRole('link', { name: 'Download' }).click();
		await expect(page).toHaveURL('/trading-view/vaults/datasets');
	});

	test('shows feature comparison table', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Feature comparison' })).toBeVisible();
	});

	test('lists DEX price data row linking to backtesting', async ({ page }) => {
		const cell = page.getByRole('cell', { name: 'DEX price data' });
		await expect(cell).toBeVisible();
		await expect(cell.getByRole('link')).toHaveAttribute('href', '/trading-view/backtesting');
	});
});
