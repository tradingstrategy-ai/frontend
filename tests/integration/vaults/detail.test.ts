import { expect, test } from '@playwright/test';
import { waitForHydration } from '../helpers';

test.describe('vault detail page', () => {
	test('preserves the chart period when copying or reloading the URL', async ({ page }) => {
		await page.goto('/vaults/morpho-flagged-blacklisted-vault?ref=shared#performance');
		await waitForHydration(page);

		const chart = page.locator('.vault-price-chart');
		await expect(chart.locator('input[value="3M"]')).toBeChecked();

		for (const [period, metricLabel] of [
			['1M', '1M ann.'],
			['Max', 'Lifetime ann.'],
			['3M', '3M ann.']
		]) {
			await chart.getByText(period, { exact: true }).click();
			await expect.poll(() => new URL(page.url()).searchParams.get('period')).toBe(period);
			expect(new URL(page.url()).searchParams.get('ref')).toBe('shared');
			expect(new URL(page.url()).hash).toBe('#performance');
			await expect(page.locator('.featured-metrics')).toContainText(metricLabel);

			const sharedUrl = page.url();
			await page.goto('about:blank');
			await page.goto(sharedUrl);
			await waitForHydration(page);
			await expect(chart.locator(`input[value="${period}"]`)).toBeChecked();
			await expect(page.locator('.featured-metrics')).toContainText(metricLabel);

			await page.reload();
			await waitForHydration(page);
			await expect(chart.locator(`input[value="${period}"]`)).toBeChecked();
			await expect(page.locator('.featured-metrics')).toContainText(metricLabel);
		}
	});

	test('uses the default chart period for an unsupported URL value', async ({ page }) => {
		await page.goto('/vaults/morpho-flagged-blacklisted-vault?period=invalid');
		await waitForHydration(page);

		await expect(page.locator('.vault-price-chart input[value="3M"]')).toBeChecked();
		await expect(page.locator('.featured-metrics')).toContainText('3M ann.');
	});

	test('does not duplicate generated Morpho risk notes', async ({ page }) => {
		await page.goto('/vaults/morpho-flagged-blacklisted-vault');

		const alerts = page.locator('.alert-list');
		await expect(alerts).toHaveCount(1);
		await expect(alerts.first()).toHaveClass(/error/);
		await expect(alerts.first()).toContainText('Morpho has flagged this vault');
		await expect(alerts.first()).toContainText('bad_debt_unrealized');
		await expect(page.locator('.notes')).toHaveCount(0);
	});

	test('hides header actions on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/vaults/morpho-flagged-blacklisted-vault');

		await expect(page.locator('.cta-actions')).toBeHidden();
	});

	// The tokenised-fund info alert on `/vaults/deposit-disabled-vault` is asserted in `funds.test.ts`.
	test('explains deposit and withdrawal availability for each vault status', async ({ page }) => {
		const warning = '.notification-stack .alert-list.warning';
		const cases = [
			{ path: '/vaults/withdrawal-disabled-vault', alert: warning, text: 'Withdrawals may be disabled for this vault' },
			{
				path: '/vaults/deposit-and-withdrawal-disabled-vault',
				alert: warning,
				text: 'Deposits and withdrawals may be disabled for this vault'
			},
			{
				path: '/vaults/capped-and-withdrawal-disabled-vault',
				alert: warning,
				text: 'Deposits are capped and withdrawals may be disabled for this vault'
			},
			{
				// a tokenised fund gets the fund disclaimer instead of the permissioned-vault warning
				path: '/vaults/private-tokenised-fund',
				alert: '.notification-stack .alert-list.info',
				text: 'Private tokenised fund is a tokenised fund',
				absent: warning
			},
			{
				path: '/vaults/deposit-cap-reached-vault',
				alert: '.transaction-status',
				text: 'Deposits Capped',
				absentText: 'Deposits Open'
			}
		];

		for (const { path, alert, text, absent, absentText } of cases) {
			await test.step(path, async () => {
				await page.goto(path);
				const element = page.locator(alert).first();
				await expect(element).toBeVisible();
				await expect(element).toContainText(text);
				if (absent) await expect(page.locator(absent)).toHaveCount(0);
				if (absentText) await expect(element).not.toContainText(absentText);
			});
		}
	});
});
