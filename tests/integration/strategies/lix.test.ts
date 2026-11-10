import { expect, test } from '@playwright/test';

const base = '/strategies/lix';

test('shows the deployed Lix description', async ({ page }) => {
	await page.goto(`${base}/description`);
	await expect(page.getByRole('heading', { name: 'Minimum equity by book' })).toBeVisible();
	await expect(page.getByText('Volatility: 1,000 USDC')).toBeVisible();
	await expect(page.getByText('Long/short: 6,000 USDC')).toBeVisible();
});

test('keeps Lighter positions internal and links each book to its own subaccount', async ({ page }) => {
	await page.goto(`${base}/open-positions`);
	const menu = page.locator('nav.strategy-nav .menu-wrapper');
	await expect(menu.getByRole('link', { name: /Open positions/ })).toHaveAttribute('href', `${base}/open-positions`);
	const details = page.getByRole('link', { name: 'Details', exact: true });
	await expect(details.first()).toBeVisible();
	expect(new Set(await details.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).size).toBe(5);
	await expect(details.nth(0)).toHaveAttribute('href', /open-positions\/\d+$/);
	await page.locator('a.row-link[href$="open-positions/2"]').click();
	await expect(page).toHaveURL(`${base}/open-positions/2`);
	await expect(page.getByRole('heading', { name: /Lighter: vol sleeve/ })).toBeVisible();

	for (const [position, account] of [
		[2, '281474976433219'],
		[3, '281474976433218'],
		[4, '281474976433215'],
		[5, '281474976433214']
	]) {
		await page.goto(`${base}/open-positions/${position}`);
		await expect(
			page
				.getByRole('button', { name: 'View Lighter subaccount' })
				.or(page.getByRole('link', { name: 'View Lighter subaccount' }))
		).toHaveAttribute('href', `https://app.lighter.xyz/explorer/accounts/${account}`);
		const priceRow = page
			.getByRole('row')
			.filter({ has: page.getByRole('cell', { name: 'Internal share price', exact: true }) });
		await expect(priceRow).toBeVisible();
		if (position === 2) await expect(priceRow).toContainText('$0.9782');
		await expect(page.getByRole('heading', { name: 'Position internal share price', exact: true })).toBeVisible();
	}
});
