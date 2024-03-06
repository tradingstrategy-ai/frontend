import { expect, test } from '@playwright/test';

test.describe('strategy index page', () => {
	test('should only display live strategies to public user', async ({ page }) => {
		await page.goto('/strategies');

		const rows = page.locator(`[data-testid="strategy-tiles"] > *`);
		expect(await rows.count()).toBe(1);

		const heading = page.getByRole('heading', { name: 'MATIC-USD breakout on Uniswap v3' });
		await expect(heading).toBeVisible();
	});

	test('should display all strategies to admin user', async ({ page }) => {
		await page.goto('/strategies?pw=secret');
		const rows = page.locator(`[data-testid="strategy-tiles"] > *`);
		expect(await rows.count()).toBe(2);
	});

	test('should only display live strategies to admin user when live filter applied', async ({ page }) => {
		await page.goto('/strategies?pw=secret');
		await page.locator('label:has-text("live")').click();

		const rows = page.locator(`[data-testid="strategy-tiles"] > *`);
		expect(await rows.count()).toBe(1);

		const heading = page.getByRole('heading', { name: 'MATIC-USD breakout on Uniswap v3' });
		await expect(heading).toBeVisible();
	});

	test('should only display non-live strategies to admin user when unpublished filter applied', async ({ page }) => {
		await page.goto('/strategies?pw=secret');
		await page.getByText('unpublished', { exact: true }).click();

		const rows = page.locator(`[data-testid="strategy-tiles"] > *`);
		expect(await rows.count()).toBe(1);

		const heading = page.getByRole('heading', { name: 'Multipair breakout strategy on Uniswap v3' });
		await expect(heading).toBeVisible();
	});

	test('should return 451 error page when requested from a blocked country', async ({ browser }) => {
		const page = await browser.newPage({
			extraHTTPHeaders: { 'CF-IPCountry': 'KP' }
		});
		const response = await page.goto('/strategies');

		expect(response?.status()).toBe(451);

		await expect(page.getByRole('heading', { name: '451' })).toBeVisible();
		await expect(page.getByText('Unavailable in North Korea')).toBeVisible();

		await page.close();
	});

	test('should return 200 success page when requested from a non-blocked country', async ({ browser }) => {
		const page = await browser.newPage({
			extraHTTPHeaders: { 'CF-IPCountry': 'US' }
		});
		const response = await page.goto('/strategies');

		expect(response?.status()).toBe(200);
		await page.close();
	});
});
