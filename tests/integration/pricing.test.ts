import { expect, test } from '@playwright/test';

test.describe('pricing page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/pricing');
	});

	test('renders with correct title', async ({ page }) => {
		await expect(page).toHaveTitle('Vault data pricing');
	});

	test('shows Basic and Pro tier cards', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
	});

	test('Pro tier shows $199/month price', async ({ page }) => {
		await expect(page.getByText('$199/month')).toBeVisible();
	});

	test('Subscribe button links to Creem checkout', async ({ page }) => {
		const btn = page.getByRole('link', { name: 'Subscribe' });
		await expect(btn).toBeVisible();
		const href = await btn.getAttribute('href');
		expect(href).toContain('creem.io');
	});

	test('Download button navigates to vault datasets page', async ({ page }) => {
		await page.getByRole('link', { name: 'Download' }).click();
		await expect(page).toHaveURL('/trading-view/vaults/datasets');
	});

	test('shows feature comparison table', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Feature comparison' })).toBeVisible();
	});

	test('API access is listed as Pro-only feature', async ({ page }) => {
		await expect(page.getByRole('cell', { name: 'API access' })).toBeVisible();
	});

	test('shows ready to get started call-to-action', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Ready to get started?' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Request early access' })).toBeVisible();
	});
});
