import { expect, test } from '@playwright/test';

test.describe('pricing page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/pricing');
	});

	test('renders with correct title', async ({ page }) => {
		await expect(page).toHaveTitle('DeFi vault market data pricing | Trading Strategy');
	});

	test('renders with correct meta description', async ({ page }) => {
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'Normalised historical returns, TVL, liquidity, fees and risk metrics for DeFi vault research, backtesting and automated data workflows.'
		);
	});

	test('renders with correct in-page title', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Build better DeFi vault allocation strategies' })).toBeVisible();
	});

	test('shows Free and Pro tier cards', async ({ page }) => {
		const plans = page.locator('#plans');
		await expect(plans.getByText('Free', { exact: true })).toBeVisible();
		await expect(plans.getByText('Pro', { exact: true })).toBeVisible();
	});

	test('Pro tier shows $199/month price', async ({ page }) => {
		await expect(page.locator('#plans').getByRole('heading', { name: /\$199\s*\/\s*month/ })).toBeVisible();
	});

	test('Start Pro button links to pricing checkout', async ({ page }) => {
		const btn = page.locator('#plans').getByRole('link', { name: 'Start Pro — $199/month' });
		await expect(btn).toBeVisible();
		const href = await btn.getAttribute('href');
		expect(href).toBe('https://www.creem.io/payment/prod_53PolewYVyya9lOWDQME1k');
	});

	test('Download free sample button navigates to vault datasets page', async ({ page }) => {
		await page.locator('.hero-actions').getByRole('link', { name: 'Download free sample' }).click();
		await expect(page).toHaveURL('/vaults/datasets');
	});

	test('shows plan comparison table', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'What changes when you move to Pro' })).toBeVisible();
	});

	test('lists DEX price data row linking to backtesting', async ({ page }) => {
		const cell = page.getByRole('cell', { name: 'DEX price data' });
		await expect(cell).toBeVisible();
		await expect(cell.getByRole('link')).toHaveAttribute('href', '/trading-view/backtesting');
	});
});
