import { expect, test } from '@playwright/test';
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

	// validate sitemaps that are served by backend
	test('sitemap entries served by backend should be valid sitemaps', async ({ request }) => {
		test.setTimeout(90_000);

		const backendSitemaps = sitemapIndex.filter(({ url }) => /\/api\//.test(url));

		for (const { url } of backendSitemaps) {
			const localSitemapUrl = new URL(url);
			const backendSitemapUrl = `${backendOrigin}${localSitemapUrl.pathname}`;
			try {
				const resp = await request.get(backendSitemapUrl, { timeout: 45_000 });
				expect(resp.ok(), `${backendSitemapUrl} returned ${resp.status()} ${resp.statusText()}`).toBe(true);
				const data = await resp.text();
				await parseSitemap(Readable.from(data));
			} catch (e) {
				throw new Error(`Failed to load or parse sitemap ${backendSitemapUrl}`, { cause: e });
			}
		}
	});
});
