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

	test.describe('stablecoin listing page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults/stablecoins');
		});

		test('has open graph meta tags', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
			await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
		});

		test('has twitter card meta tags', async ({ page }) => {
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
		});
	});

	test.describe('stablecoin detail page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults/stablecoins/usdc');
		});

		test('has open graph meta tags with metadata description', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /USDC/i);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
				'content',
				/fully-reserved|stablecoin/i
			);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
		});

		test('has open graph image from stablecoin logo', async ({ page }) => {
			await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /stablecoin-metadata\/usdc/);
		});

		test('has twitter card with large image when logo available', async ({ page }) => {
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
			await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /stablecoin-metadata\/usdc/);
		});

		test('has JSON-LD structured data with image', async ({ page }) => {
			const jsonLd = page.locator('script[type="application/ld+json"]');
			const content = await jsonLd.textContent();
			expect(content).toBeTruthy();
			const data = JSON.parse(content!);
			expect(data['@type']).toBe('CollectionPage');
			expect(data.image).toContain('stablecoin-metadata/usdc');
		});

		test('renders stablecoin description box', async ({ page }) => {
			await expect(page.locator('text=About USD Coin')).toBeVisible();
			await expect(page.locator('text=fully-reserved')).toBeVisible();
		});
	});

	test.describe('zero-vault stablecoin detail page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/trading-view/vaults/stablecoins/frax');
		});

		test('renders without 404', async ({ page }) => {
			await expect(page).not.toHaveTitle(/404|not found/i);
		});

		test('has open graph meta tags from metadata', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Frax/i);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
				'content',
				/fractional-algorithmic/i
			);
		});

		test('renders stablecoin description box', async ({ page }) => {
			await expect(page.locator('text=About Frax')).toBeVisible();
		});
	});
});
