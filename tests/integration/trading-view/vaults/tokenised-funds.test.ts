import { expect, test } from '@playwright/test';

test.describe('tokenised funds page', () => {
	test('lists tokenised funds and links to the glossary explanation', async ({ page }) => {
		await page.goto('/trading-view/vaults/tokenised-funds');

		await expect(page).toHaveTitle('Tokenised funds');
		await expect(page.locator('h1')).toHaveText('Tokenised funds');
		await expect(page.locator('.vault-listings-selector a', { hasText: 'Tokenised funds' })).toHaveAttribute(
			'href',
			'/trading-view/vaults/tokenised-funds'
		);
		await expect(
			page.getByRole('link', { name: 'Read more about the differences between vaults and tokenised funds here.' })
		).toHaveAttribute('href', '/glossary/tokenised-fund');
		await expect(page.getByText('Tracking $20.00K net asset value across 1 fund.')).toBeVisible();
		await expect(page.getByText('Total $20.00K tokenised fund NAV')).toBeVisible();
		await expect(page.getByTestId('tokenised-fund-nav-pie-chart').locator('canvas')).toBeVisible({
			timeout: 15000
		});
		await expect(page.locator('tbody tr.targetable')).toHaveCount(1);
		await expect(page.locator('tbody tr.targetable')).toContainText('Deposit disabled vault');
	});

	test('explains the tokenised fund structure instead of the deposit warning', async ({ page }) => {
		await page.goto('/trading-view/vaults/deposit-disabled-vault');

		const alert = page.locator('.alert-list.info').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText(
			'Deposit disabled vault is a tokenised fund. It is smart contract-based, but may not offer all features of vaults.'
		);
		await expect(
			alert.getByRole('link', { name: 'Read more about the differences between vaults and tokenised funds here.' })
		).toHaveAttribute('href', '/glossary/tokenised-fund');
		await expect(alert).not.toContainText('Deposits may be disabled for this vault');
	});
});
