import { expect, test } from '@playwright/test';

test.describe('pricing page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/pricing');
	});

	test('renders metadata, plan cards and the comparison table', async ({ page }) => {
		await expect(page).toHaveTitle('DeFi vault market data pricing | Trading Strategy');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'Normalised historical returns, TVL, liquidity, fees and risk metrics for DeFi vault research, backtesting and automated data workflows.'
		);
		await expect(page.getByRole('heading', { name: 'Build better DeFi vault allocation strategies' })).toBeVisible();

		const plans = page.locator('#plans');
		await expect(plans.getByText('Free', { exact: true })).toBeVisible();
		await expect(plans.getByText('Pro', { exact: true })).toBeVisible();
		await expect(plans.getByRole('heading', { name: /\$199\s*\/\s*month/ })).toBeVisible();

		const startPro = plans.getByRole('link', { name: 'Start Pro — $199/month' });
		await expect(startPro).toBeVisible();
		expect(await startPro.getAttribute('href')).toBe('https://www.creem.io/payment/prod_53PolewYVyya9lOWDQME1k');

		await expect(page.getByRole('heading', { name: 'What changes when you move to Pro' })).toBeVisible();
		const cell = page.getByRole('cell', { name: 'DEX price data' });
		await expect(cell).toBeVisible();
		await expect(cell.getByRole('link')).toHaveAttribute('href', '/trading-view/backtesting');
	});

	test('Download free sample button navigates to vault datasets page', async ({ page }) => {
		await page.locator('.hero-actions').getByRole('link', { name: 'Download free sample' }).click();
		await expect(page).toHaveURL('/vaults/datasets');
	});
});
