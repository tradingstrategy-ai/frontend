import { expect, test } from '@playwright/test';
import { dequal } from 'dequal';
import { merge } from '$lib/helpers/object';

const defaultSearchParams = {
	q: '',
	sortBy: 'tvl:desc',
	filters: {
		pair_swap_fee: [],
		price_change_24h: [],
		liquidity: [],
		volume_24h: [],
		type: [],
		blockchain: [],
		exchange: []
	}
} as const;

// merge given search params with defaults
function getSearchParams(searchParams: object) {
	return merge(structuredClone(defaultSearchParams), searchParams);
}

// merge given search params with defaults, then strigify (with `filters` as nested strigified JSON)
function getUrlSearchParams(searchParams: object) {
	const params = getSearchParams(searchParams);
	params.filters = JSON.stringify(params.filters);
	return new URLSearchParams(params);
}

// return a function that tests if URL search params match expected value
function urlParamsMatch(expected: Record<string, any>) {
	return (url: URL) => {
		const { filters, ...searchParams } = Object.fromEntries(url.searchParams);
		if (filters) {
			searchParams.filters = JSON.parse(filters);
		}
		return dequal(searchParams, expected);
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
		const params = getUrlSearchParams({ filters });
		await page.goto(`/search?${params}`);

		for (const name of ['Pair', 'Ethereum', 'Uniswap v2', '> $1M']) {
			await expect(page.getByRole('checkbox', { name })).toBeChecked();
		}
	});

	test('should populate URL query params with default search options', async ({ page }) => {
		await page.goto('/search');
		const expected = getSearchParams({});
		await page.waitForURL(urlParamsMatch(expected), { timeout: 5000 });
	});

	test('should update URL query params to reflect selected search options', async ({ page }) => {
		test.skip(!!process.env.CI, 'Skipping on CI runs for now');

		await page.goto('/search');

		await page.getByRole('searchbox').focus();
		await page.keyboard.type('eth');
		await page.getByRole('combobox').selectOption('price_change:asc');
		await page.getByText('binance', { exact: true }).click();
		await page.getByText('Up > 5%').click();

		const expected = getSearchParams({
			q: 'eth',
			sortBy: 'price_change:asc',
			filters: {
				price_change_24h: ['price_change_24h:>0.05'],
				blockchain: ['binance']
			}
		});

		await page.waitForURL(urlParamsMatch(expected), { timeout: 5000 });
	});

	test('should retain selected search options when navigating to search result and back', async ({ page }) => {
		test.skip(!!process.env.CI, 'Skipping on CI runs for now');

		await page.goto('/search');

		// update some search options (search text, sort drop-down, filter)
		const searchBox = page.getByRole('searchbox');
		await searchBox.focus();
		await page.keyboard.type('eth');
		await searchBox.blur();
		await page.getByRole('combobox').selectOption('volume:desc');
		await page.getByText('ethereum', { exact: true }).click();

		// wait for URL params to reflect the search selections (computer is faster than human)
		const expected = getSearchParams({
			q: 'eth',
			sortBy: 'volume:desc',
			filters: { blockchain: ['ethereum'] }
		});
		await page.waitForURL(urlParamsMatch(expected), { timeout: 5000 });

		// click on search result, wait for token page to load, click "back" button
		await page.getByText('USDC on Ethereum').click();
		await page.waitForURL(/ethereum\/tokens\/0xa0b8699/);
		await page.goBack();

		// wait until we're back on the search page; verify search options are retained
		await page.waitForURL(urlParamsMatch(expected), { timeout: 5000 });
		await expect(page.getByRole('searchbox')).toHaveValue('eth');
		await expect(page.getByRole('combobox')).toHaveValue('volume:desc');
		await expect(page.getByRole('checkbox', { name: 'ethereum' })).toBeChecked();
	});
});
