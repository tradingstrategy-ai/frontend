import { expect, test } from '@playwright/test';
import { chains } from '../../../src/lib/helpers/chain';

test.describe('chain index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/blockchains');
	});

	test('tiles should include exchange count', async ({ page }) => {
		const blockchains = page.getByRole('link', { name: /[\d,]+ exchanges/ });
		const count = await blockchains.count();
		expect(count).toBeGreaterThan(0);
	});

	test('chain tile should link to chain details', async ({ page }) => {
		const chain = page.getByRole('link', { name: /Ethereum/ });
		await chain.click();
		await expect(page).toHaveURL(/ethereum/);
	});

	test('tile data (from API) should match local chain helper', async ({ page }) => {
		for (const chain of chains) {
			const tile = page.getByTestId(`chain-${chain.id}-${chain.slug}`);
			const title = tile.getByRole('heading', { name: chain.name, exact: true });
			await expect(title).toBeVisible();
		}
	});
});
