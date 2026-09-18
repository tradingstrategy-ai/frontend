import { expect, test } from '@playwright/test';

test.describe('diagnostics page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/diagnostics');
	});

	test('should not have admin role by default', async ({ page }) => {
		const adminRole = page.getByText('You do not have admin role');
		await expect(adminRole).toBeVisible();
	});

	test('should acquire admin role via admin pw submission', async ({ page }) => {
		// Wait for hydration: a value typed into the password field before the component hydrates is
		// wiped when it re-renders, and the form then submits an empty `pw`.
		await expect(page.locator('#navigation-panel-toggle')).toHaveAttribute('data-navigation-hydrated', 'true');
		await page.getByPlaceholder('Enter admin pw').fill('secret');
		await page.getByRole('button', { name: 'Save' }).click();
		await page.waitForURL('/diagnostics?pw=secret');

		const adminRole = page.getByText('You have admin role');
		await expect(adminRole).toBeVisible();
	});

	test('should remove admin role via Clear button', async ({ page }) => {
		await page.goto('/diagnostics?pw=secret');
		await page.getByRole('button', { name: 'Clear' }).click();
		await page.waitForURL('/diagnostics?pw=');

		const adminRole = page.getByText('You do not have admin role');
		await expect(adminRole).toBeVisible();
	});
});
