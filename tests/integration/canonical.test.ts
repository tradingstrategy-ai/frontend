import { expect, test } from '@playwright/test';

/**
 * Every page must carry exactly one `<link rel="canonical">`, emitted by `AppHead`. Two
 * canonicals (or none) leave the choice to the search engine; query strings must be dropped
 * unless they identify the page.
 */

const samples: { path: string; canonical: string }[] = [
	{ path: '/', canonical: '/' },
	{ path: '/vaults', canonical: '/vaults' },
	{ path: '/vaults?sort=tvl&direction=desc', canonical: '/vaults' },
	{ path: '/vaults/return-leader-alpha', canonical: '/vaults/return-leader-alpha' },
	{ path: '/strategies/trading-strategy-ichiv3-ls-2', canonical: '/strategies/trading-strategy-ichiv3-ls-2' },
	{ path: '/trading-view/ethereum', canonical: '/trading-view/ethereum' },
	{
		path: '/trading-view/ethereum/uniswap-v2/eth-usdc?timeBucket=1h',
		canonical: '/trading-view/ethereum/uniswap-v2/eth-usdc'
	},
	{
		path: '/trading-view/ethereum/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		canonical: '/trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
	},
	{ path: '/glossary', canonical: '/glossary' },
	{ path: '/search?q=keyring', canonical: '/search' },
	{ path: '/about', canonical: '/about' },
	{
		path: '/vaults/compare?vault=1-0xa3931d71877c0e7a3148cb7eb4463524fec27fbd&vault=4663-0xd4d607239dcbdb5cc3a301266433810bb63c63bf&period=3M',
		canonical:
			'/vaults/compare?vault=1-0xa3931d71877c0e7a3148cb7eb4463524fec27fbd&vault=4663-0xd4d607239dcbdb5cc3a301266433810bb63c63bf'
	}
];

test.describe('canonical link', () => {
	for (const { path, canonical } of samples) {
		test(`${path} declares exactly one canonical`, async ({ request }) => {
			const response = await request.get(path);
			expect(response.status()).toBe(200);
			const html = await response.text();

			const links = html.match(/<link[^>]*rel="canonical"[^>]*>/g) ?? [];
			expect(links, 'canonical links in HTML').toHaveLength(1);
			// attribute values are HTML-escaped, so `&` between query params arrives as `&amp;`
			const expectedCanonical = new URL(canonical, response.url()).href;
			expect(links[0]?.replaceAll('&amp;', '&')).toContain(`href="${expectedCanonical}"`);
		});
	}
});
