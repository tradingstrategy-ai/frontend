import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should render the home page with correct title', async ({ page }) => {
		await expect(page).toHaveTitle('DeFi vault rankings, yields and risk data | Trading Strategy');
	});

	test('should display featured strategies section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Trading Strategy vaults' })).toBeVisible();
	});

	test('should display top vaults section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Top DeFi Vaults' })).toBeVisible();
	});

	test('should display blog section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
	});

	test('should preload exactly one hero background per viewport', async ({ request }) => {
		const html = await (await request.get('/')).text();
		// the media query contains an unescaped `>`, so match to the self-closing tag end
		const preloads = html.match(/<link rel="preload" as="image".*?\/>/g) ?? [];
		expect(preloads).toHaveLength(2);
		const media = preloads.map((link) => link.match(/media="([^"]*)"/)?.[1]?.replaceAll('&lt;', '<'));
		expect(media).toEqual(expect.arrayContaining(['(width <= 768px)', '(width > 768px)']));
		expect(preloads.every((link) => link.includes('fetchpriority="high"'))).toBe(true);
	});

	test('should lazy-load the vault ecosystem widget without crashing', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));

		await page.goto('/');

		const widgetHeading = page.getByRole('heading', { name: 'See where capital earns most' });
		await widgetHeading.scrollIntoViewIfNeeded();
		await expect(widgetHeading).toBeVisible();

		const chart = page.locator('.echarts-ecosystem-chart canvas');
		await expect(chart).toBeVisible({ timeout: 15000 });
		await expect(page.getByText('Data failed to load')).toHaveCount(0);
		expect(errors).toHaveLength(0);
	});
});
