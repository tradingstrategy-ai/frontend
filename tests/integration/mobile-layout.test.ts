import { expect, test, type Page } from '@playwright/test';

const mobileViewport = { width: 375, height: 667 };

/** Assert that a page cannot be panned horizontally outside its mobile viewport. */
async function expectNoHorizontalPageScroll(page: Page) {
	const dimensions = await page.evaluate(() => {
		window.scrollTo({ left: document.documentElement.scrollWidth, top: 0 });

		return {
			viewportWidth: window.innerWidth,
			documentWidth: document.documentElement.scrollWidth,
			bodyWidth: document.body.scrollWidth,
			horizontalOffset: window.scrollX
		};
	});

	expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
	expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
	expect(dimensions.horizontalOffset).toBe(0);
}

test.describe('mobile layout', () => {
	for (const path of ['/', '/vaults', '/vaults/return-leader-alpha']) {
		test(`${path} does not allow horizontal page scrolling`, async ({ page }) => {
			await page.setViewportSize(mobileViewport);
			await page.goto(path, { waitUntil: 'networkidle' });

			await expectNoHorizontalPageScroll(page);
		});
	}

	test('home hero actions have equal widths', async ({ page }) => {
		await page.setViewportSize(mobileViewport);
		await page.goto('/', { waitUntil: 'networkidle' });

		const actions = page.getByTestId('home-hero-banner').getByRole('link');
		const [strategyAction, vaultAction] = await Promise.all([
			actions.nth(0).boundingBox(),
			actions.nth(1).boundingBox()
		]);

		expect(strategyAction).not.toBeNull();
		expect(vaultAction).not.toBeNull();
		expect(strategyAction!.width).toBeCloseTo(vaultAction!.width, 0);
		expect(strategyAction!.x).toBeGreaterThanOrEqual(0);
		expect(strategyAction!.x + strategyAction!.width).toBeLessThanOrEqual(mobileViewport.width);
	});
});
