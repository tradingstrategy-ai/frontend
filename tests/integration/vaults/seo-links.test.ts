import { expect, test } from '@playwright/test';

// Internal links and wording added in SEO round 4 (.claude/plans/seo-round-4-vault-rankings.md)
test.describe('vault SEO links', () => {
	test('vault pages link to similar vaults on the same protocol and name their returns section', async ({ page }) => {
		await page.goto('/vaults/return-leader-alpha');

		const similar = page.locator('.similar-vaults');
		await expect(similar.getByRole('heading', { name: 'Similar Yearn vaults' })).toBeVisible();
		const links = similar.locator('li a');
		expect(await links.count()).toBeGreaterThan(0);
		await expect(links.first()).toHaveAttribute('href', /^\/vaults\/[a-z0-9-]+$/);
		await expect(links.filter({ hasText: 'Return leader alpha' })).toHaveCount(0);
		await expect(similar.getByRole('link', { name: 'All Yearn vaults' })).toHaveAttribute(
			'href',
			'/vaults/protocols/yearn'
		);

		await expect(page.getByText('Return leader alpha APY and returns')).toBeVisible();
	});

	test('listings link to the ranking methodology', async ({ page }) => {
		await page.goto('/vaults');
		await page.getByRole('link', { name: 'How we rank vaults' }).click();

		await expect(page).toHaveURL('/vaults/methodology');
		await expect(page.getByRole('heading', { name: 'How we rank DeFi vaults', level: 1 })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'How APY is calculated' })).toBeVisible();
	});
});
