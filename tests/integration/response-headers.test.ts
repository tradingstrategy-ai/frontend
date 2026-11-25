import { expect, test } from '@playwright/test';

/**
 * Response-header contract set by `handleResponseHeaders` in `src/hooks.server.ts` and the
 * image endpoints: font `Link` preloads on HTML pages only (Cloudflare turns them into Early
 * Hints, pure waste on XML, JSON and images), no JS chunk preloads from SvelteKit (CSS and
 * the `@font-face` rules are inlined), `X-Robots-Tag: noindex` on generated images,
 * and cache lifetimes on bundled logos and on the edge-cacheable URLs of `$lib/helpers/edge-cache`.
 */
test.describe('preload headers', () => {
	test('text-led templates preload the primary faces; no page preloads a font stylesheet', async ({ request }) => {
		const listing = (await request.get('/vaults')).headers()['link'] ?? '';
		expect(listing).not.toContain('fonts7.css');
		expect(listing).not.toContain('woff2');

		const glossary = (await request.get('/glossary/leverage')).headers()['link'] ?? '';
		expect(glossary).toContain('NeueHaasGroteskText/55.woff2>; rel=preload; as=font');
	});

	test('HTML pages inline their CSS and font faces and preload no JS chunks', async ({ request }) => {
		const response = await request.get('/vaults');
		expect(response.headers()['link'] ?? '').not.toContain('modulepreload');
		const html = await response.text();
		expect(html).toContain('<style id="font-faces">@font-face{');
		expect(html).toContain('url("/fonts/NeueHaasGroteskText/55.woff2")');
		expect(html).not.toContain('href="/fonts/fonts7.css"');
	});

	test('non-HTML responses carry no font preloads', async ({ request }) => {
		for (const path of ['/sitemap.xml', '/social-card/trading-strategy', '/vaults/sitemap.xml']) {
			const link = (await request.get(path)).headers()['link'] ?? '';
			expect(link, path).not.toContain('fonts');
		}
	});
});

test.describe('logo caching', () => {
	test('bundled SVG logos are cacheable for 24 hours, with or without the .svg extension', async ({ request }) => {
		for (const path of ['/logos/blockchains/ethereum.svg', '/logos/blockchains/ethereum']) {
			const response = await request.get(path);
			expect(response.status()).toBe(200);
			expect(response.headers()['content-type']).toContain('image/svg+xml');
			expect(response.headers()['cache-control']).toBe('public, max-age=86400, stale-while-revalidate=86400');
		}
	});
});

test.describe('edge-cacheable URLs', () => {
	const DEFAULT_CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=86400';

	test('social cards are served as .png for 24 hours, and the old URL still works', async ({ request }) => {
		for (const path of ['/social-card/trading-strategy.png', '/social-card/trading-strategy']) {
			const response = await request.get(path);
			expect(response.status(), path).toBe(200);
			expect(response.headers()['content-type'], path).toBe('image/png');
			expect(response.headers()['cache-control'], path).toBe(DEFAULT_CACHE_CONTROL);
			expect(response.headers()['x-robots-tag'], path).toBe('noindex');
		}
	});

	test('chart data is served as .bin with a JSON content type, and the old URL still works', async ({ request }) => {
		for (const path of ['/vaults/historical-tvl-chain/chart-data.bin', '/vaults/historical-tvl-chain/chart-data']) {
			const response = await request.get(path);
			expect(response.status(), path).toBe(200);
			expect(response.headers()['content-type'], path).toContain('application/json');
			await response.json();
		}
	});

	test('chart data without its own Cache-Control gets the 24-hour default', async ({ request }) => {
		const response = await request.get('/vaults/yield-chain/chart-data.bin?minTvl=0');
		expect(response.status()).toBe(200);
		expect(response.headers()['cache-control']).toBe(DEFAULT_CACHE_CONTROL);
	});

	test('chart-data redirects keep the .bin extension', async ({ request }) => {
		const response = await request.get('/vaults/categories/algorithmic-trading/chart-data.bin?window=30d', {
			maxRedirects: 0
		});
		expect(response.status()).toBe(308);
		expect(response.headers()['location']).toBe('/vaults/strategies/algorithmic-trading/chart-data.bin?window=30d');
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
