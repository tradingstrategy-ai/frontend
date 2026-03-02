import { expect, test } from '@playwright/test';

const INJECT_REPORT = '/strategies/trading-strategy-ichiv3-ls-2/backtest/report';
const NO_INJECT_REPORT = '/strategies/backtest-no-inject/backtest/report';

test.describe('YAML strategy backtest report', () => {
	test('should inject iframe resizer when inject_backtest_iframe_resizer is true', async ({ page }) => {
		await page.goto(INJECT_REPORT);

		const html = await page.content();
		expect(html).toContain('iframeContentHeight');
		expect(html).toContain('ResizeObserver');
		expect(html).toContain('overflow: hidden');
	});

	test('should not inject iframe resizer when inject_backtest_iframe_resizer is false', async ({ page }) => {
		await page.goto(NO_INJECT_REPORT);

		const html = await page.content();
		// The file's own snippet is present
		expect(html).toContain('iframeContentHeight');
		// But the injected CSS reset should not be present
		expect(html).not.toContain('overflow: hidden');
	});
});
