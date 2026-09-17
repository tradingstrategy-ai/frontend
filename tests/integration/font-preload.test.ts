import { expect, test } from '@playwright/test';

/**
 * The font `Link` preload headers (see `$lib/server/font-preload`) belong on HTML pages
 * only; Cloudflare turns them into Early Hints, which would be pure waste on XML, JSON
 * and image responses.
 */
test.describe('font preload headers', () => {
	test('HTML pages preload the stylesheet, text-led templates the primary faces too', async ({ request }) => {
		const listing = (await request.get('/vaults')).headers()['link'] ?? '';
		expect(listing).toContain('/fonts/fonts6.css>; rel=preload; as=style');
		expect(listing).not.toContain('woff2');

		const glossary = (await request.get('/glossary/leverage')).headers()['link'] ?? '';
		expect(glossary).toContain('NeueHaasGroteskText/55.woff2>; rel=preload; as=font');
	});

	test('non-HTML responses carry no font preloads', async ({ request }) => {
		for (const path of ['/sitemap.xml', '/social-card/trading-strategy', '/vaults/sitemap.xml']) {
			const link = (await request.get(path)).headers()['link'] ?? '';
			expect(link, path).not.toContain('fonts');
		}
	});
});

test.describe('logo caching', () => {
	test('bundled SVG logos are cacheable for a week', async ({ request }) => {
		const response = await request.get('/logos/blockchains/ethereum');
		expect(response.status()).toBe(200);
		expect(response.headers()['cache-control']).toBe('public, max-age=604800, stale-while-revalidate=86400');
	});
});
