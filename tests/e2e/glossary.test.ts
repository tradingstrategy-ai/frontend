/**
 * Glossary site section tests.
 *
 * These tests rely on https://tradingstrategy.ai/docs/glossary.html source data to be online
 *
 * To run:
 *
 * 		npx playwright test --config tests/e2e -g glossary
 * 		npx playwright install chromium
 */
import { expect, test } from '@playwright/test';

test.describe('glossary tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/glossary');
	});

	test('should have a list of terms', async ({ page }) => {
		const terms = page.locator('a[data-testid="index-term"]');
		const count = await terms.count();
		expect(count).toBeGreaterThanOrEqual(5);
	});

	test('clicking any term should open What is page', async ({ page }) => {
		const a = page.locator('a[data-testid="index-term"]').first();
		await a.click();
		await page.isVisible('[data-testid="glossary-heading"]');
	});
});
