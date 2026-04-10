import { expect, test } from '@playwright/test';
import { hasPrivateR2Secrets } from '../../../helpers';

const hasSecrets = hasPrivateR2Secrets('test', 'local');

test.describe('private R2 vault dataset metadata', () => {
	test.skip(!hasSecrets, 'Private R2 secrets are not configured for integration tests');

	test('shows vault prices metadata from the private bucket', async ({ page }) => {
		await page.goto('/trading-view/vaults/datasets');

		const vaultPricesRow = page.locator('tbody tr').filter({ hasText: 'Vault prices' });
		await expect(vaultPricesRow).toHaveCount(1);
		await expect(vaultPricesRow.locator('td').nth(3)).not.toHaveText('Unavailable');
		await expect(vaultPricesRow.locator('td').nth(4)).not.toHaveText('Unavailable');
	});
});
