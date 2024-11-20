import { expect, test } from '@playwright/test';

test('pair details should include pair summary info', async ({ page }) => {
	await page.goto('/trading-view/ethereum/uniswap-v2/wise-eth');
	const pairInfo = page.getByTestId('pair-info');
	await expect(pairInfo).toHaveText(/Token\s+WISE/);
	await expect(pairInfo).toHaveText(/Quoted in\s+ETH/);
	await expect(pairInfo).toHaveText(/Price\s+[\d.,]+\s+USD/);
	await expect(pairInfo).toHaveText(/Token price\s+[\d.,]+\s+ETH/);
});
