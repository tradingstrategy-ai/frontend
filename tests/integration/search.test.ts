import { expect, test } from '@playwright/test';
import equal from 'fast-deep-equal';

function urlParamsMatch(expected: Record<string, any>) {
	return ({ searchParams }) => {
		return equal(Object.fromEntries(searchParams), expected);
	};
}

test.describe('advanced search page', () => {
	test('should pre-fill search based on q param', async ({ page }) => {
		await page.goto('/search?q=eth');
		await expect(page.getByRole('searchbox')).toHaveValue('eth');
	});

	test('should pre-select sort drop-down based on sortBy param', async ({ page }) => {
		await page.goto('/search?sortBy=volume:desc');
		await expect(page.getByRole('combobox')).toHaveValue('volume:desc');
	});

	test('should pre-select filters based on filters param', async ({ page }) => {
		const filters = {
			type: ['pair'],
			blockchain: ['ethereum'],
			exchange: ['Uniswap v2'],
			volume_24h: ['Infinity-1000000']
		};
		const params = new URLSearchParams({ filters: JSON.stringify(filters) });
		await page.goto(`/search?${params}`);

		for (const name of ['Pair', 'Ethereum', 'Uniswap v2', '> $1M']) {
			await expect(page.getByRole('checkbox', { name })).toBeChecked();
		}
	});

	test('should populate URL query params with default search options', async ({ page }) => {
		await page.goto('/search');

		const expected = {
			q: '',
			sortBy: 'liquidity:desc',
			filters: JSON.stringify({
				price_change_24h: [],
				liquidity: [],
				volume_24h: [],
				type: [],
				blockchain: [],
				exchange: []
			})
		};

		await page.waitForURL(urlParamsMatch(expected), { timeout: 1000 });
	});

	test('should update URL query params to reflect selected search options', async ({ page }) => {
		await page.goto('/search');

		await page.getByRole('searchbox').focus();
		await page.keyboard.type('foo');
		await page.getByRole('combobox').selectOption('price_change:asc');
		await page.getByText('Binance').click();
		await page.getByText('Up > 5%').click();

		const expected = {
			q: 'foo',
			sortBy: 'price_change:asc',
			filters: JSON.stringify({
				price_change_24h: ['price_change_24h:>0.05'],
				liquidity: [],
				volume_24h: [],
				type: [],
				blockchain: ['binance'],
				exchange: []
			})
		};

		await page.waitForURL(urlParamsMatch(expected), { timeout: 1000 });
	});
});
