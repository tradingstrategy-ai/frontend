import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	const h1 = page.locator('h1');
	await expect(h1).toHaveText('Next generation algorithmic trading protocol for decentralised markets');
});
