import { expect, test } from '@playwright/test';

test.describe('pair index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/trading-pairs');
	});

	test('should include table with 10 body rows', async ({ page }) => {
		const tableRows = page.getByTestId('pairs-table').locator('tbody tr');
		await expect(tableRows).toHaveCount(10);
	});

	test('clicking table row should open correct pair details page', async ({ page }) => {
		const firstRow = page.getByTestId('pairs-table').locator('tbody tr').nth(1);
		const pairSymbol = await firstRow.locator('.pair_symbol').innerText();

		await firstRow.click();
		await page.waitForURL(/trading-view\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+/);

		const heading = page.getByRole('heading', { level: 1, name: pairSymbol });
		await expect(heading).toBeVisible();
	});

	test('clicking table footer next button should advance page', async ({ page }) => {
		const pairsTable = page.getByTestId('pairs-table');
		const firstPairSymbol = await pairsTable.locator('tbody .pair_symbol').nth(1).innerText();

		const nextButton = pairsTable.locator('tfoot').getByRole('button', { name: 'Next' });
		await nextButton.click();
		await page.waitForURL(/page=1/);

		const newPairSymbol = await pairsTable.locator('tbody .pair_symbol').nth(1).innerText();
		expect(newPairSymbol).not.toBe(firstPairSymbol);
	});

	test('clicking table row after advancing page should open correct pair details page', async ({ page }) => {
		const pairsTable = page.getByTestId('pairs-table');
		const nextButton = pairsTable.locator('tfoot').getByRole('button', { name: 'Next' });
		await nextButton.click();
		await page.waitForURL(/page=1/);

		const firstRow = pairsTable.locator('tbody tr').nth(1);
		const pairSymbol = await firstRow.locator('.pair_symbol').innerText();

		await firstRow.click();
		await page.waitForURL(/trading-view\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+/);

		const heading = page.getByRole('heading', { level: 1, name: pairSymbol });
		await expect(heading).toBeVisible();
	});
});
