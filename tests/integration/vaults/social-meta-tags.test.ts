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

async function imageHasCardContent(page: Page, src: string) {
	return page.evaluate(
		(imageSrc) =>
			new Promise<boolean>((resolve, reject) => {
				const image = new Image();
				image.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = image.naturalWidth;
					canvas.height = image.naturalHeight;
					const context = canvas.getContext('2d');
					if (!context) return reject(new Error('Could not create social-card canvas'));
					context.drawImage(image, 0, 0);
					const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
					for (let index = 0; index < pixels.length; index += 4) {
						const [red, green, blue] = [pixels[index], pixels[index + 1], pixels[index + 2]];
						if (Math.max(Math.abs(red - 23), Math.abs(green - 37), Math.abs(blue - 84)) > 8) return resolve(true);
					}
					resolve(false);
				};
				image.onerror = () => reject(new Error(`Could not decode social card image: ${imageSrc}`));
				image.src = imageSrc;
			}),
		src
	);
}

/** Every page must carry the same site-wide Open Graph and Twitter card scaffolding. */
async function expectSiteSocialTags(page: Page) {
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
	await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
	await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /.+/);
	await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
	await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
	await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /.+/);
	await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /.+/);
}

// `head-meta.test.ts` owns the title, description length and "exactly one og:image" contract; this
// file owns the social card itself — tag values, image URL, decode and card content.
test.describe('vault social meta tags', () => {
	test('vault index page uses the Trading Strategy card with a decodable 1200×630 image', async ({ page }) => {
		await page.goto('/vaults');

		await expectSiteSocialTags(page);
		await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
		await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png');
		await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
		await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
		const src = await page.locator('meta[property="og:image"]').getAttribute('content');

		expect(await getImageDimensions(page, src!)).toEqual({ width: 1200, height: 630 });
		expect(await imageHasCardContent(page, src!)).toBe(true);
	});

	// the same generated card as `/vaults`, so only the tags and image URL are checked here
	for (const path of ['/vaults/high-tvl', '/vaults/new-vaults', '/vaults/stablecoins']) {
		test(`${path} carries social tags and never leaves the card image empty`, async ({ page }) => {
			await page.goto(path);

			await expectSiteSocialTags(page);
			await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
		});
	}

	test.describe('stablecoin detail page', () => {
		test('uses the stablecoin metadata for tags, logo image, JSON-LD and description box', async ({ page }) => {
			await page.goto('/vaults/stablecoins/usdc');

			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'USDC vaults');
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
				'content',
				/fully-reserved|stablecoin/i
			);
			await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Trading Strategy');
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
			await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', '@TradingProtocol');
			await expectSocialCardImage(page, stablecoinLogoUrlPattern);

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

			// search wording: "usdc vault", "best usdc yield"
			await expect(page).toHaveTitle('USDC vaults | best USDC yield | Trading Strategy');
			await expect(page.locator('h1')).toContainText('USDC vaults');
			await expect(page.locator('text=About USD Coin')).toBeVisible();
			await expect(page.locator('text=fully-reserved')).toBeVisible();
		});

		test('uses the Trading Strategy image when no stablecoin logo is available', async ({ page }) => {
			await page.goto('/vaults/stablecoins/usd-offchain');

			await expectSocialCardImage(page, /\/social-card\/trading-strategy$/);
		});

		test('renders a zero-vault stablecoin from metadata instead of a 404', async ({ page }) => {
			await page.goto('/vaults/stablecoins/frax');

			await expect(page).not.toHaveTitle(/404|not found/i);
			await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Frax/i);
			await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
				'content',
				/fractional-algorithmic/i
			);
			await expect(page.locator('text=About Frax')).toBeVisible();
		});
	});

	test.describe('social card image priority', () => {
		test('uses a sparkline before every logo fallback on a vault', async ({ page }) => {
			await page.goto('/vaults/return-leader-alpha');

			await expectSocialCardImage(page, /\/social-card\/vault\/.+\?fallback=.+$/);
		});

		test('uses the contextual fallback when a sparkline is unavailable', async ({ page }) => {
			const response = await page.goto('/social-card/vault/missing?fallback=/social-card/trading-strategy');

			expect(page.url()).toMatch(/\/social-card\/trading-strategy$/);
			expect(response?.headers()['content-type']).toMatch(/^image\/png/);
		});

		test('rejects external fallback redirects and malformed vault IDs', async ({ page }) => {
			const externalFallback = await page.request.get(
				'/social-card/vault/missing?fallback=https://example.com/image.png',
				{ maxRedirects: 0 }
			);
			expect(externalFallback.status()).toBe(400);

			const malformedId = await page.request.get(
				'/social-card/vault/not.a-vault?fallback=/social-card/trading-strategy'
			);
			expect(malformedId.status()).toBe(400);
		});

		test('accepts normalised curator and protocol fallbacks for their vaults', async ({ page }) => {
			const vaultsResponse = await page.request.get('/api/top-vaults/vaults.json');
			const { vaults } = (await vaultsResponse.json()) as {
				vaults: Array<{ id: string; protocol: string; curator_slug: string | null }>;
			};
			const curatorVault = vaults.find((vault) => vault.curator_slug === 'steakhouse-financial');
			const protocolVault = vaults.find((vault) => vault.protocol === 'Yearn' && !vault.curator_slug);

			expect(curatorVault).toBeDefined();
			expect(protocolVault).toBeDefined();

			const curatorResponse = await page.request.get(
				`/social-card/vault/${encodeURIComponent(curatorVault!.id)}?fallback=${encodeURIComponent(
					'http://LOCALHOST:4173/api/curators/steakhouse-financial/light.png'
				)}`
			);
			const protocolResponse = await page.request.get(
				`/social-card/vault/${encodeURIComponent(protocolVault!.id)}?fallback=${encodeURIComponent(
					'http://localhost:4173/api/vault-protocols/yearn/dark.png'
				)}`
			);

			expect(curatorResponse.headers()['content-type']).toMatch(/^image\/png/);
			expect(protocolResponse.headers()['content-type']).toMatch(/^image\/png/);
		});

		test('serves sparklines for colon-containing vault IDs', async ({ page }) => {
			const response = await page.request.get(
				'/social-card/vault/325-vlt%3Atest?fallback=/social-card/trading-strategy'
			);

			expect(response.headers()['content-type']).toMatch(/^image\/png/);
		});

		test('uses a curator logo on a curator listing', async ({ page }) => {
			await page.goto('/vaults/curators/steakhouse-financial');

			await expectSocialCardImage(page, /\/api\/curators\/steakhouse-financial\/light\.png$/);
		});

		test('uses a protocol logo on a protocol listing', async ({ page }) => {
			await page.goto('/vaults/protocols/yearn');

			await expectSocialCardImage(page, /\/metadata-logo\/protocol\/yearn\?format=original$/);
		});

		test('uses a blockchain logo on a blockchain listing', async ({ page }) => {
			await page.goto('/vaults/chains/ethereum');

			await expectSocialCardImage(page, /\/social-card\/blockchain\/ethereum$/);
			const src = await page.locator('meta[property="og:image"]').getAttribute('content');

			expect(await getImageDimensions(page, src!)).toEqual({ width: 1200, height: 630 });
		});

		test('renders dark blockchain logos with visible card content', async ({ page }) => {
			await page.goto('/vaults/chains/megaeth');
			await expectSocialCardImage(page, /\/social-card\/blockchain\/megaeth$/);
			const src = await page.locator('meta[property="og:image"]').getAttribute('content');

			expect(await imageHasCardContent(page, src!)).toBe(true);
		});
	});
});
