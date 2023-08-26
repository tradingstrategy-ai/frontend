import { expect, test } from '@playwright/test';

test('strategy index page', async ({ page }) => {
	await page.goto('/strategies');
	const heading = page.getByRole('heading', { name: 'MATIC-USD breakout on Uniswap v3' });
	await expect(heading).toBeVisible();
});
