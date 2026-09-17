import { expect, test } from '@playwright/test';
import { BLOG_POST_SLUG } from '../../mocks/ghost/posts.mock';

const postPath = `/blog/${BLOG_POST_SLUG}`;
const playerHosts = /youtube\.com|doubleclick\.net|googleapis\.com/;

test.describe('blog post embeds', () => {
	test('loads no YouTube player before the reader asks for it', async ({ page }) => {
		const playerRequests: string[] = [];
		page.on('request', (request) => {
			if (playerHosts.test(request.url())) playerRequests.push(request.url());
		});

		await page.goto(postPath, { waitUntil: 'networkidle' });

		const facade = page.locator('a.youtube-facade');
		await expect(facade).toHaveCount(1);
		await expect(facade).toHaveAttribute('href', 'https://www.youtube.com/watch?v=PWNJyuylDv8');
		await expect(page.locator('iframe.youtube-facade')).toHaveCount(0);
		expect(playerRequests).toEqual([]);

		// other players are still iframes, just lazy
		await expect(page.locator('iframe[src*="spotify"]')).toHaveAttribute('loading', 'lazy');
	});

	test('swaps the facade for the player on click, keeping the box size', async ({ page }) => {
		await page.goto(postPath);
		const facade = page.locator('a.youtube-facade');
		const before = await facade.boundingBox();

		await facade.click();

		const iframe = page.locator('iframe.youtube-facade');
		await expect(iframe).toHaveCount(1);
		await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/PWNJyuylDv8\?autoplay=1/);
		await expect(iframe).toHaveAttribute('title', 'Episode #12: Atoma');
		await expect(page.locator('a.youtube-facade')).toHaveCount(0);

		const after = await iframe.boundingBox();
		expect(after?.width).toBeCloseTo(before!.width, 0);
		expect(after?.height).toBeCloseTo(before!.height, 0);
	});

	test('activates from the keyboard', async ({ page }) => {
		await page.goto(postPath);
		await page.locator('a.youtube-facade').focus();
		await page.keyboard.press('Enter');
		await expect(page.locator('iframe.youtube-facade')).toHaveCount(1);
	});
});

test.describe('blog post metadata', () => {
	test('has a short description, brand title and BlogPosting structured data', async ({ page }) => {
		await page.goto(postPath);

		await expect(page).toHaveTitle('Test post with embeds | Trading Strategy');

		const description = await page.locator('head meta[name="description"]').getAttribute('content');
		expect(description!.length).toBeGreaterThan(50);
		expect(description!.length).toBeLessThanOrEqual(155);

		const jsonLd = await page.locator('head script[type="application/ld+json"]').allTextContents();
		const posting = jsonLd.map((text) => JSON.parse(text)).find((schema) => schema['@type'] === 'BlogPosting');
		expect(posting).toBeDefined();
		expect(posting.headline).toBe('Test post with embeds');
		expect(posting.image[0]).toMatch(/^http:\/\/127\.0\.0\.1:4173\/blog\/image\//);
		expect(posting.publisher).toMatchObject({
			'@type': 'Organization',
			'@id': 'https://tradingstrategy.ai/#organization'
		});
		expect(posting.author['@type']).toBe('Organization');
		expect(jsonLd.filter((text) => text.includes('NewsArticle'))).toEqual([]);
	});
});
