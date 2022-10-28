import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	// This test is useful for validating that custom fonts are installed and loaded.
	// If there's a legitimate change to the hero banner, generate new screenshots by
	// deleting the old ones from `tests/integration/index.test.ts-snapshots` and running
	// the folling commands (2nd one is needed for CI to pass correctly):
	// $ npm run test:integration
	// $ docker run -v $(pwd):/work/ mcr.microsoft.com/playwright:v1.27.0-focal bash -c 'cd work && npm run test:integration --skip-build'
	test('hero banner looks correct', async ({ page }) => {
		const header = page.locator('main header');
		await expect(header).toHaveScreenshot();
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
