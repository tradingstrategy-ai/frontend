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
			'exchanges/sitemap',
			'pairs/paged/0'
		];

		for (const expected of expectedEntries) {
			const found = sitemapIndex.find(({ url }) => url.includes(expected));
			expect(found).toBeTruthy();
		}
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

	test('should include static vault sub-pages', async () => {
		const expectedSubPages = [
			'/vaults/all',
			'/vaults/blacklisted',
			'/vaults/high-tvl',
			'/vaults/new-vaults',
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
});
