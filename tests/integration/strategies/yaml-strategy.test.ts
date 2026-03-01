import { expect, test } from '@playwright/test';

test.describe('YAML-configured strategy', () => {
	test('should appear in the strategies listing', async ({ page }) => {
		await page.goto('/strategies');

		const heading = page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' });
		await expect(heading).toBeVisible();
	});

	test('should display vault metrics in the strategy tile', async ({ page }) => {
		await page.goto('/strategies');

		const tile = page.locator('[data-testid="strategy-tiles"]').filter({ hasText: 'ICHI v3 Liquidity Strategy' });
		await expect(tile).toBeVisible();
		await expect(tile).toContainText('TVL');
	});

	test('should render the overview page', async ({ page }) => {
		const response = await page.goto('/strategies/trading-strategy-ichiv3-ls-2');
		expect(response?.status()).toBe(200);

		await expect(page.getByRole('heading', { name: 'ICHI v3 Liquidity Strategy' })).toBeVisible();
	});

	test('should display vault metrics on the overview page', async ({ page }) => {
		await page.goto('/strategies/trading-strategy-ichiv3-ls-2');

		await expect(page.getByText('TVL')).toBeVisible();
		await expect(page.getByText('$500')).toBeVisible();
	});

	test('should have a link to the vault detail page', async ({ page }) => {
		await page.goto('/strategies/trading-strategy-ichiv3-ls-2');

		const vaultLink = page.getByRole('link', { name: 'View vault details' });
		await expect(vaultLink).toBeVisible();
		await expect(vaultLink).toHaveAttribute('href', /trading-view\/vaults\/trading-strategy-ichiv3-ls-2/);
	});
});
