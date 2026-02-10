import { expect, test } from '@playwright/test';

test.describe('vault social meta tags', () => {
	test.describe('vault index page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults');
		});

		test('has open graph meta tags', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
			await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
		});

		test('has twitter card meta tags', async ({ page }) => {
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
			await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /.+/);
		});
	});

	test.describe('high TVL listing page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults/high-tvl');
		});

		test('has open graph meta tags', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
		});

		test('has twitter card meta tags', async ({ page }) => {
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
		});
	});

	test.describe('new vaults listing page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults/new-vaults');
		});

		test('has open graph meta tags', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
		});

		test('has twitter card meta tags', async ({ page }) => {
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
		});
	});
});
