import { expect, test } from '@playwright/test';

/**
 * Response-header contract set by `handleResponseHeaders` in `src/hooks.server.ts` and the
 * image endpoints: font `Link` preloads on HTML pages only (Cloudflare turns them into Early
 * Hints, pure waste on XML, JSON and images), `X-Robots-Tag: noindex` on generated images,
 * and cache lifetimes on bundled logos.
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

test.describe('generated image endpoints', () => {
	test('social cards carry X-Robots-Tag: noindex', async ({ request }) => {
		const response = await request.get('/social-card/trading-strategy');
		expect(response.status()).toBe(200);
		expect(response.headers()['x-robots-tag']).toBe('noindex');
	});

	test('vault social-card fallback redirects carry X-Robots-Tag: noindex', async ({ request }) => {
		const response = await request.get(
			'/social-card/vault/1-0x0000000000000000000000000000000000000001?fallback=/social-card/trading-strategy',
			{
				maxRedirects: 0
			}
		);
		expect([302, 200]).toContain(response.status());
		expect(response.headers()['x-robots-tag']).toBe('noindex');
	});
});
