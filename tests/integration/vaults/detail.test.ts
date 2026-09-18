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
		const cases: [slug: string, selector: string, text: string][] = [
			['/vaults/withdrawal-disabled-vault', '.alert-list.warning', 'Withdrawals may be disabled for this vault'],
			[
				'/vaults/deposit-and-withdrawal-disabled-vault',
				'.alert-list.warning',
				'Deposits and withdrawals may be disabled for this vault'
			],
			[
				'/vaults/capped-and-withdrawal-disabled-vault',
				'.alert-list.warning',
				'Deposits are capped and withdrawals may be disabled for this vault'
			],
			[
				'/vaults/private-tokenised-fund',
				'.notification-stack .alert-list.info',
				'Private tokenised fund is a tokenised fund'
			]
		];

		for (const [slug, selector, text] of cases) {
			await test.step(slug, async () => {
				await page.goto(slug);
				const alert = page.locator(selector).first();
				await expect(alert).toBeVisible();
				await expect(alert).toContainText(text);
			});
		}

		await test.step('/vaults/private-tokenised-fund shows no permissioned warning', async () => {
			await expect(page.locator('.notification-stack .alert-list.warning')).toHaveCount(0);
		});

		await test.step('/vaults/deposit-cap-reached-vault shows deposits as capped, not open', async () => {
			await page.goto('/vaults/deposit-cap-reached-vault');
			const transactionStatus = page.locator('.transaction-status');
			await expect(transactionStatus).toContainText('Deposits Capped');
			await expect(transactionStatus).not.toContainText('Deposits Open');
		});
	});
});
