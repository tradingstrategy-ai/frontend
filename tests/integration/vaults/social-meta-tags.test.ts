import { expect, test, type Page } from '@playwright/test';

const stablecoinLogoUrlPattern = /metadata-logo\/stablecoin\/usdc\?format=original/;

async function expectSocialCardImage(page: Page, expectedImage: RegExp) {
	const openGraphImage = page.locator('meta[property="og:image"]');
	const twitterImage = page.locator('meta[name="twitter:image"]');

	await expect(openGraphImage).toHaveCount(1);
	await expect(twitterImage).toHaveCount(1);
	await expect(openGraphImage).toHaveAttribute('content', expectedImage);
	await expect(twitterImage).toHaveAttribute('content', expectedImage);
	await expect(openGraphImage).toHaveAttribute('content', /^https?:\/\/.+/);
	await expect(twitterImage).toHaveAttribute('content', /^https?:\/\/.+/);
	await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /.+/);
	await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', /.+/);

	const openGraphUrl = await openGraphImage.getAttribute('content');
	const twitterUrl = await twitterImage.getAttribute('content');
	expect(openGraphUrl).toBe(twitterUrl);
	expect(openGraphUrl).toBeTruthy();

	const response = await page.request.get(openGraphUrl!);
	expect(response.ok()).toBe(true);
	expect(response.headers()['content-type']).toMatch(/^image\//);
}

async function getImageDimensions(page: Page, src: string) {
	return page.evaluate(
		(imageSrc) =>
			new Promise<{ width: number; height: number }>((resolve, reject) => {
				const image = new Image();
				image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
				image.onerror = () => reject(new Error(`Could not decode social card image: ${imageSrc}`));
				image.src = imageSrc;
			}),
		src
	);
}

test.describe('vault social meta tags', () => {
	test.describe('vault index page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults');
		});

		test('has open graph meta tags', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /.+/);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
			await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
		});

		test('uses the Trading Strategy image for social card previews', async ({ page }) => {
			await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
			await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png');
			await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
			await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
			const src = await page.locator('meta[property="og:image"]').getAttribute('content');

			expect(await getImageDimensions(page, src!)).toEqual({ width: 1200, height: 630 });
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
			await page.goto('/vaults/high-tvl');
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

		test('never leaves the social card preview image empty', async ({ page }) => {
			await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
		});
	});

	test.describe('new vaults listing page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults/new-vaults');
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

		test('never leaves the social card preview image empty', async ({ page }) => {
			await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
		});
	});

	test.describe('stablecoin listing page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults/stablecoins');
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

		test('never leaves the social card preview image empty', async ({ page }) => {
			await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
		});
	});

	test.describe('stablecoin detail page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults/stablecoins/usdc');
		});

		test('has open graph meta tags with metadata description', async ({ page }) => {
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
				'content',
				'USD Coin (Circle) USDC stablecoin vaults | Trading Strategy'
			);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
				'content',
				/fully-reserved|stablecoin/i
			);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
		});

		test('has open graph image from stablecoin logo', async ({ page }) => {
			await expectSocialCardImage(page, stablecoinLogoUrlPattern);
		});

		test('has twitter card with large image when logo available', async ({ page }) => {
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
			await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', stablecoinLogoUrlPattern);
		});

		test('has JSON-LD structured data with FinancialProduct about block', async ({ page }) => {
			const jsonLd = page.locator('script[type="application/ld+json"]');
			const content = await jsonLd.textContent();
			expect(content).toBeTruthy();
			const data = JSON.parse(content!);
			expect(data['@type']).toBe('CollectionPage');
			expect(data.image).toMatch(stablecoinLogoUrlPattern);
			expect(data.about).toBeTruthy();
			expect(data.about['@type']).toBe('FinancialProduct');
			expect(data.about.name).toContain('USDC');
			expect(data.about.category).toBe('stablecoin');
			expect(data.about.sameAs).toEqual(expect.arrayContaining([expect.stringContaining('coingecko')]));
		});

		test('renders stablecoin description box', async ({ page }) => {
			await expect(page).toHaveTitle('USD Coin (Circle) USDC stablecoin vaults | Trading Strategy');
			await expect(page.locator('h1')).toContainText('USD Coin (Circle) USDC stablecoin vaults');
			await expect(page.locator('text=About USD Coin')).toBeVisible();
			await expect(page.locator('text=fully-reserved')).toBeVisible();
		});
	});

	test.describe('social card image priority', () => {
		test('uses a curator logo before protocol, blockchain and stablecoin logos on a vault', async ({ page }) => {
			await page.goto('/vaults/return-leader-alpha');

			await expectSocialCardImage(page, /\/social-card\/trading-strategy\?source=steakhouse-financial$/);
		});

		test('uses a curator logo on a curator listing', async ({ page }) => {
			await page.goto('/vaults/curators/steakhouse-financial');

			await expectSocialCardImage(page, /\/social-card\/trading-strategy\?source=steakhouse-financial$/);
		});

		test('uses a protocol logo when no curator logo is available', async ({ page }) => {
			await page.goto('/vaults/limited-coverage-vault');

			await expectSocialCardImage(page, /\/metadata-logo\/protocol\/yearn\?format=original$/);
		});

		test('uses a protocol logo on a protocol listing', async ({ page }) => {
			await page.goto('/vaults/protocols/yearn');

			await expectSocialCardImage(page, /\/metadata-logo\/protocol\/yearn\?format=original$/);
		});

		test('uses a blockchain logo when curator and protocol logos are unavailable', async ({ page }) => {
			await page.goto('/vaults/above-tvl-001');

			await expectSocialCardImage(page, /\/social-card\/blockchain\/polygon$/);
		});

		test('uses a blockchain logo on a blockchain listing', async ({ page }) => {
			await page.goto('/vaults/chains/ethereum');

			await expectSocialCardImage(page, /\/social-card\/blockchain\/ethereum$/);
			const src = await page.locator('meta[property="og:image"]').getAttribute('content');

			expect(await getImageDimensions(page, src!)).toEqual({ width: 1200, height: 630 });
		});
	});

	test.describe('zero-vault stablecoin detail page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults/stablecoins/frax');
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
