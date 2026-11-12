import { expect, test } from '@playwright/test';

const account = 'J7qhMAKnB6G5dvoAN9281ufabajKbyGQxxd2bq6R7fPJ';

test('lists Solana vaults and displays the native account with its explorer link', async ({ page }) => {
	await page.goto('/vaults/chains/solana?tvl=any');
	await expect(page.getByRole('link', { name: 'Neutral Autopilot', exact: true })).toBeVisible();
	await page.goto('/vaults/neutral-autopilot');
	const address = page.locator(`a[href="https://solscan.io/account/${account}"]`);
	await expect(address).toHaveText(account);
	await expect(page.locator('img[src="/logos/blockchains/solana"]').first()).toBeVisible();
});

test('keeps Solana token exploration unavailable', async ({ page }) => {
	const response = await page.goto('/trading-view/solana/tokens');
	expect(response?.status()).toBe(404);
});
