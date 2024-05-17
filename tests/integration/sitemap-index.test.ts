import { expect, test } from '@playwright/test';
import { type IndexItem, parseSitemap, parseSitemapIndex } from 'sitemap';
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
			} catch (e) {
				throw new Error(`Failed to load or parse sitemap ${url}`);
			}
		});

		// test passes if no exceptions thrown
		await Promise.all(promises);
	});
});
