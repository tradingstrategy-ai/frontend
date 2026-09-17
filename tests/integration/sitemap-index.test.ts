import { expect, test } from '@playwright/test';
import { type IndexItem, type SitemapItem, parseSitemap, parseSitemapIndex } from 'sitemap';
import { Readable } from 'stream';

test.describe('sitemap index', () => {
	let sitemapIndex: IndexItem[];

	test.beforeAll(async ({ request }) => {
		const data = await (await request.get('/sitemap.xml')).text();
		sitemapIndex = await parseSitemapIndex(Readable.from(data));
	});

	test('should include expected sitemap entries', async () => {
		const expectedEntries = [
			'sitemap-static',
			'blog/sitemap',
			'docs/sitemap',
			'glossary/sitemap',
			'strategies/sitemap',
			'blockchains/sitemap',
			'vaults/sitemap',
			'exchanges/sitemap'
		];

		for (const expected of expectedEntries) {
			const found = sitemapIndex.find(({ url }) => url.includes(expected));
			expect(found).toBeTruthy();
		}
	});

	test('should not submit the backend pair sitemaps', async () => {
		// most pair pages are noindex; see docs/google-webmasters.md
		expect(sitemapIndex.some(({ url }) => url.includes('pairs/paged'))).toBe(false);
	});

	test('local sitemap entries should be valid sitemaps', async ({ request }) => {
		// skip `docs` and `api` sitemaps (not served by frontend)
		const localSitemaps = sitemapIndex.filter(({ url }) => !/\/docs|api\//.test(url));

		// fetch and parse sitemaps in parallel
		const promises = localSitemaps.map(async ({ url }) => {
			try {
				const data = await (await request.get(url)).text();
				await parseSitemap(Readable.from(data));
			} catch {
				throw new Error(`Failed to load or parse sitemap ${url}`);
			}
		});

		// test passes if no exceptions thrown
		await Promise.all(promises);
	});
});

test.describe('vaults sitemap', () => {
	let urls: string[];

	test.beforeAll(async ({ request }) => {
		const data = await (await request.get('/vaults/sitemap.xml')).text();
		const items: SitemapItem[] = await parseSitemap(Readable.from(data));
		urls = items.map((item) => item.url);
	});

	test('should include individual vault detail pages', async () => {
		const vaultPages = urls.filter((url) => /\/vaults\/[a-z0-9-]+$/.test(url));
		expect(vaultPages.length).toBeGreaterThan(0);
	});

	test('should include protocol index and individual protocol pages', async () => {
		expect(urls.some((url) => url.endsWith('/vaults/protocols'))).toBe(true);

		const protocolPages = urls.filter((url) => /\/vaults\/protocols\/[a-z0-9-]+$/.test(url));
		expect(protocolPages.length).toBeGreaterThan(0);
	});

	test('should include stablecoin index and individual stablecoin pages', async () => {
		expect(urls.some((url) => url.endsWith('/vaults/stablecoins'))).toBe(true);

		const stablecoinPages = urls.filter((url) => /\/vaults\/stablecoins\/[a-z0-9-]+$/.test(url));
		expect(stablecoinPages.length).toBeGreaterThan(0);
	});

	test('should include chain index and individual chain pages', async () => {
		expect(urls.some((url) => url.endsWith('/vaults/chains'))).toBe(true);

		const chainPages = urls.filter((url) => /\/vaults\/chains\/[a-z0-9-]+$/.test(url));
		expect(chainPages.length).toBeGreaterThan(0);
	});

	test('should include curator index and individual curator pages', async () => {
		expect(urls.some((url) => url.endsWith('/vaults/curators'))).toBe(true);

		const curatorPages = urls.filter((url) => /\/vaults\/curators\/[a-z0-9-]+$/.test(url));
		expect(curatorPages.length).toBeGreaterThan(0);
	});

	test('should include strategy index and dash-separated individual strategy pages', async () => {
		expect(urls.some((url) => url.endsWith('/vaults/strategies'))).toBe(true);

		const categoryPages = urls.filter((url) => /\/vaults\/strategies\/[a-z0-9-]+$/.test(url));
		expect(categoryPages.length).toBeGreaterThan(0);
		expect(categoryPages.some((url) => url.includes('_'))).toBe(false);
		expect(categoryPages.some((url) => url.endsWith('/vaults/strategies/unknown'))).toBe(false);
	});

	test('should include static vault sub-pages', async () => {
		const expectedSubPages = [
			'/vaults/all',
			'/vaults/high-tvl',
			'/vaults/new-vaults',
			'/vaults/whitelisted',
			'/vaults/funds',
			'/vaults/current-peak-tvl',
			'/vaults/cumulative-tvl-apy',
			'/vaults/yield-chain',
			'/vaults/yield-protocol',
			'/vaults/yield-risk'
		];

		for (const expected of expectedSubPages) {
			expect(urls.some((url) => url.endsWith(expected))).toBe(true);
		}
	});

	test('should not submit noindex pages', async () => {
		// listed vault with real TVL
		expect(urls.some((url) => url.endsWith('/vaults/return-leader-alpha'))).toBe(true);
		// $1k current and peak TVL on a known protocol
		expect(urls.some((url) => url.endsWith('/vaults/continuation-vault-000'))).toBe(false);
		// $1k TVL on an unknown protocol
		expect(urls.some((url) => url.endsWith('/vaults/summary-regression-high-return-vault-000'))).toBe(false);
		// $49k TVL on an unknown protocol stays indexable
		expect(urls.some((url) => url.endsWith('/vaults/summary-regression-large-low-return-vault'))).toBe(true);
		// noindex listing pages
		expect(urls.some((url) => url.endsWith('/vaults/blacklisted'))).toBe(false);
		expect(urls.some((url) => url.endsWith('/vaults/protocols/unknown'))).toBe(false);
	});
});

test.describe('vault page robots', () => {
	const robotsMeta = 'head meta[name="robots"]';

	test('indexable vault pages carry no robots tag', async ({ page }) => {
		await page.goto('/vaults/return-leader-alpha');
		await expect(page.locator(robotsMeta)).toHaveCount(0);
	});

	test('vaults below the TVL threshold are noindex', async ({ page }) => {
		await page.goto('/vaults/continuation-vault-000');
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
	});

	test('the unknown-protocol and blacklisted listings are noindex', async ({ page }) => {
		await page.goto('/vaults/protocols/unknown');
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
		await page.goto('/vaults/blacklisted');
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
	});
});
