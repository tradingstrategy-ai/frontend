import { expect, test } from '@playwright/test';
import { waitForHydration } from './helpers';

test.describe('diagnostics page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/diagnostics');
	});

	test('should not have admin role by default', async ({ page }) => {
		const adminRole = page.getByText('You do not have admin role');
		await expect(adminRole).toBeVisible();
	});

	test('should acquire admin role via admin pw submission', async ({ page }) => {
		await waitForHydration(page);
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

	test('shows the server cache table to admins only', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Server caches' })).toHaveCount(0);
		await page.goto('/diagnostics?pw=secret');
		await expect(page.getByRole('heading', { name: 'Server caches' })).toBeVisible();
	});
});

test.describe('internal cache warm endpoint', () => {
	test('rejects requests without the per-process token', async ({ request }) => {
		const response = await request.post('/_internal/cache/warm?job=all');
		expect(response.status()).toBe(401);
		expect(response.headers()['cache-control']).toBe('private, no-store');

		const guessed = await request.post('/_internal/cache/warm?job=all', {
			headers: { authorization: 'Bearer not-the-token' }
		});
		expect(guessed.status()).toBe(401);
	});
});
