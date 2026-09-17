import { expect, test } from '@playwright/test';
import { UNKNOWN_EXCHANGE_SLUG } from '../../mocks/exchanges/detail.mock';

const robotsMeta = 'head meta[name="robots"]';

test.describe('exchange details page', () => {
	test('named exchanges are indexable', async ({ page }) => {
		await page.goto('/trading-view/ethereum/uniswap-v3');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Uniswap v3');
		await expect(page.locator(robotsMeta)).toHaveCount(0);
	});

	test('unnamed exchanges (address slugs) are noindex', async ({ page }) => {
		await page.goto(`/trading-view/ethereum/${UNKNOWN_EXCHANGE_SLUG}`);
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
	});

	test('export-data pages are never indexed', async ({ page }) => {
		await page.goto('/trading-view/ethereum/uniswap-v3/export-data');
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
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
