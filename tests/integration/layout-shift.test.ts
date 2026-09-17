import { type Page, expect, test } from '@playwright/test';

const LIQUID_TOKEN_PATH = '/trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

/**
 * Layout-shift guard for the templates Search Console groups under its mobile CLS issue.
 *
 * The `layout-shift` observer must be installed before navigation so the shifts caused by
 * hydration are captured. The client-side `pairs` request on the token page is delayed so the
 * skeleton → data transition of the pair table is observable rather than racing hydration, and
 * the web fonts are delayed so the fallback → web font swap happens after first paint (locally
 * they would otherwise arrive before the page renders and the metric-matched fallbacks in
 * `static/fonts/fonts6.css` would never be exercised).
 */

declare global {
	interface Window {
		__layoutShifts: { value: number; hadRecentInput: boolean }[];
	}
}

const mobileViewport = { width: 375, height: 667 };

/** Search Console flags a URL group at 0.1; keep well inside that. */
const CLS_BUDGET = 0.05;

async function measureCls(page: Page, path: string) {
	await page.setViewportSize(mobileViewport);
	await page.addInitScript(() => {
		window.__layoutShifts = [];
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
				window.__layoutShifts.push({ value: entry.value, hadRecentInput: entry.hadRecentInput });
			}
		}).observe({ type: 'layout-shift', buffered: true });
	});
	await page.route('**/api/pairs?*', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		await route.continue();
	});
	await page.route('**/fonts/**/*.woff2', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 800));
		await route.continue();
	});

	await page.goto(path, { waitUntil: 'networkidle' });
	// let the delayed table data land and any late transitions settle
	await page.waitForTimeout(1_000);

	return page.evaluate(() =>
		window.__layoutShifts.filter((shift) => !shift.hadRecentInput).reduce((sum, shift) => sum + shift.value, 0)
	);
}

test.describe('layout shift', () => {
	test('token page stays within the CLS budget on a phone', async ({ page }) => {
		expect(await measureCls(page, LIQUID_TOKEN_PATH)).toBeLessThan(CLS_BUDGET);
	});

	test('pair page stays within the CLS budget on a phone', async ({ page }) => {
		expect(await measureCls(page, '/trading-view/ethereum/uniswap-v2/eth-usdc')).toBeLessThan(CLS_BUDGET);
	});

	test('glossary term page stays within the CLS budget on a phone (font swap)', async ({ page }) => {
		expect(await measureCls(page, '/glossary/leverage')).toBeLessThan(CLS_BUDGET);
	});
});
