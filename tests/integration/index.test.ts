import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('home page uses custom heading font', async ({ page }) => {
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toHaveScreenshot();
	});

	test('home page has impressive numbers', async ({ page }) => {
		const section = page.getByText(/Market data and trading strategy framework/);

		const pairs = section.getByText('15,000 trading pairs');
		await expect(pairs).toHaveAttribute('href', '/trading-view/trading-pairs');

		const liquidity = section.getByText('$1.23B liquidity');
		await expect(liquidity).toHaveAttribute('href', '/trading-view/trading-pairs');

		const blockchains = section.getByText(/3 blockchains/);
		await expect(blockchains).toHaveAttribute('href', '/trading-view/blockchains');
	});
});
