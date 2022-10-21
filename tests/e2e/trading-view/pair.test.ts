import { expect, test } from '@playwright/test';

test('pair details should include pair summary info', async ({ page }) => {
	await page.goto('/trading-view/ethereum/uniswap-v2/wise-eth');
	const pairInfo = page.getByTestId('pair-info');
	await expect(pairInfo).toHaveText(/Token WISE/);
	await expect(pairInfo).toHaveText(/Quoted in ETH/);
	await expect(pairInfo).toHaveText(/Price [\d.,]+ USD/);
	await expect(pairInfo).toHaveText(/Token price [\d.,]+ ETH/);
});
