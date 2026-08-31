import { expect, test } from '@playwright/test';

for (const [provider, path] of [
	['CORE3', '/vaults/core3-ratings'],
	['Xerberus', '/vaults/xerberus-ratings']
] as const) {
	test(`${provider} ratings match the provider-wide non-blacklisted population`, async ({ page }) => {
		await page.goto(path);

		const rows = page.locator('tbody tr.targetable');
		await expect(rows).toHaveCount(3);
		await expect(rows.filter({ hasText: 'Provider rated vault' })).toHaveCount(1);
		await expect(rows.filter({ hasText: 'Provider rated unknown protocol vault' })).toHaveCount(1);
		await expect(rows.filter({ hasText: 'Provider rated AMM vault' })).toHaveCount(1);
		await expect(rows.filter({ hasText: 'Abnormal TVL blacklisted vault' })).toHaveCount(0);
		await expect(page.getByTestId('top-vaults-meta')).toContainText('3 vaults');
		await expect(page.getByTestId('show-blacklisted-vaults')).toHaveCount(0);
	});
}
