import { expect, test } from '@playwright/test';

test.describe('blog index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog');
	});

	test('should load initial blog post tiles', async ({ page }) => {
		const posts = page.locator('[data-testid="blog-roll"] a');
		const count = await posts.count();
		expect(count).toBeGreaterThanOrEqual(5);
	});

	test('clicking blog tile heading should open post', async ({ page }) => {
		test.setTimeout(60000);
		const tile = page.locator('[data-testid="blog-roll"] article').first();
		const heading = tile.getByRole('heading');
		const titleLink = heading.getByRole('link');
		const url = await titleLink.getAttribute('href');
		const title = await heading.textContent();
		await titleLink.click();
		await expect(page).toHaveURL(url!);
		await expect(page).toHaveTitle(title!);
	});
});
