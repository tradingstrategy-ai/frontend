import { expect, test } from '@playwright/test';

test.describe('vault detail page', () => {
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
