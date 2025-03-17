import { test } from '@playwright/test';
import { error } from '@sveltejs/kit';
import { type IndexItem, parseSitemap, parseSitemapIndex } from 'sitemap';
import { Readable } from 'stream';

// NOTE: doesn't work to import backendUrl from lib/config.js in test context
const backendOrigin = 'https://tradingstrategy.ai';

test.describe('sitemap index', () => {
	let sitemapIndex: IndexItem[];

	test.beforeAll(async ({ request }) => {
		const data = await (await request.get('/sitemap.xml')).text();
		sitemapIndex = await parseSitemapIndex(Readable.from(data));
	});

	// validate sitemaps that are servied by backend
	test('sitemap entries served by backend should be valid sitemaps', async ({ request }) => {
		const backendSitemaps = sitemapIndex.filter(({ url }) => /\/api\//.test(url));

		// fetch and parse sitemaps in parallel
		const promises = backendSitemaps.map(async ({ url }) => {
			const localSitemapUrl = new URL(url);
			const backendSitemapUrl = `${backendOrigin}${localSitemapUrl.pathname}`;
			try {
				const resp = await request.get(backendSitemapUrl);
				if (!resp.ok()) {
					error(resp.status(), resp.statusText());
				}
				const data = await resp.text();
				await parseSitemap(Readable.from(data));
			} catch (e) {
				throw new Error(`Failed to load or parse sitemap ${backendSitemapUrl}`);
			}
		});

		// test passes if no exceptions thrown
		await Promise.all(promises);
	});
});
