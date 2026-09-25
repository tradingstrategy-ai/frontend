import { expect, test } from '@playwright/test';
import { BLOG_POST_SLUG } from '../mocks/ghost/posts.mock';

/**
 * Search-snippet contract for every indexable template.
 *
 * - exactly one `<link rel="canonical">`, emitted by `AppHead`; two canonicals (or none)
 *   leave the choice to the search engine, and query strings must be dropped unless they
 *   identify the page
 * - exactly one `<title>` carrying the brand suffix, one meta description of a length Google
 *   shows in full, and one `og:image` — see `SocialCardMetaTags`
 *
 * The description floor is skipped for `verbatimDescription` samples: `getStrategyPageMeta`
 * (`src/lib/strategies/seo.ts`) ships a vault's curator-supplied short description as-is,
 * deliberately without padding it with generated return/TVL or generic vault copy, so it can
 * land under `DESCRIPTION_MIN_LENGTH` when the curator's own text is short.
 */

const samples: { path: string; canonical: string; verbatimDescription?: boolean }[] = [
	{ path: '/', canonical: '/' },
	{ path: '/vaults', canonical: '/vaults' },
	{ path: '/vaults?sort=tvl&direction=desc', canonical: '/vaults' },
	{ path: '/vaults/return-leader-alpha', canonical: '/vaults/return-leader-alpha' },
	{
		path: '/strategies/trading-strategy-ichiv3-ls-2',
		canonical: '/strategies/trading-strategy-ichiv3-ls-2',
		verbatimDescription: true
	},
	{ path: '/trading-view/ethereum', canonical: '/trading-view/ethereum' },
	{
		path: '/trading-view/ethereum/uniswap-v2/eth-usdc?timeBucket=1h',
		canonical: '/trading-view/ethereum/uniswap-v2/eth-usdc'
	},
	{
		path: '/trading-view/ethereum/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		canonical: '/trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
	},
	{ path: '/trading-view/ethereum/uniswap-v3', canonical: '/trading-view/ethereum/uniswap-v3' },
	{ path: '/glossary', canonical: '/glossary' },
	{ path: '/glossary/leverage', canonical: '/glossary/leverage' },
	{ path: '/blog', canonical: '/blog' },
	{ path: `/blog/${BLOG_POST_SLUG}`, canonical: `/blog/${BLOG_POST_SLUG}` },
	{ path: '/search?q=keyring', canonical: '/search' },
	{ path: '/about', canonical: '/about' },
	{ path: '/community', canonical: '/community' },
	{ path: '/newsletter', canonical: '/newsletter' },
	{ path: '/vaults/api', canonical: '/vaults/api' },
	{ path: '/podcast', canonical: '/podcast' },
	{
		path: '/vaults/compare?vault=1-0xa3931d71877c0e7a3148cb7eb4463524fec27fbd&vault=4663-0xd4d607239dcbdb5cc3a301266433810bb63c63bf&period=3M',
		canonical:
			'/vaults/compare?vault=1-0xa3931d71877c0e7a3148cb7eb4463524fec27fbd&vault=4663-0xd4d607239dcbdb5cc3a301266433810bb63c63bf'
	}
];

const DESCRIPTION_MIN_LENGTH = 70;
const DESCRIPTION_MAX_LENGTH = 155;

test.describe('head metadata', () => {
	for (const { path, canonical, verbatimDescription } of samples) {
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

		test(`${path} has a branded title, a full-length description and a social image`, async ({ request }) => {
			const html = await (await request.get(path)).text();
			const head = html.slice(0, html.indexOf('</head>'));

			const titles = head.match(/<title>([\s\S]*?)<\/title>/g) ?? [];
			expect(titles, 'title tags').toHaveLength(1);
			expect(titles[0]!.replace(/\s+/g, ' ')).toMatch(/Trading Strategy<\/title>$/);

			const descriptions = head.match(/<meta name="description" content="([^"]*)"/g) ?? [];
			expect(descriptions, 'description tags').toHaveLength(1);
			const description = descriptions[0]!.match(/content="([^"]*)"/)![1]!.replaceAll('&amp;', '&');
			if (!verbatimDescription) {
				expect(description.length, `description: ${description}`).toBeGreaterThanOrEqual(DESCRIPTION_MIN_LENGTH);
			}
			expect(description.length, `description: ${description}`).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);

			expect(head.match(/<meta property="og:image" content="/g) ?? [], 'og:image tags').toHaveLength(1);
		});
	}
});
