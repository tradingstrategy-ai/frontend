/**
 * Generate sitemap index with entries for all the sitemaps
 */
import { fetchPublicApi } from '$lib/helpers/public-api';
import { SitemapIndexStream } from 'sitemap';
import { Readable } from 'stream';

const PAIR_SITEMAP_PAGE_SIZE = 25_000;

const baseSitemaps = [
	// served by frontend
	'sitemap-static.xml',
	'blog/sitemap.xml',
	'glossary/sitemap.xml',
	'strategies/sitemap.xml',
	'trading-view/blockchains/sitemap.xml',

	// served by documentation site
	'docs/sitemap-docs.xml',

	// served by backend
	'api/sitemap/exchanges/sitemap.xml'
];

/**
 * Find the current number of pair entries returned by /api/datasets and calculate
 * how many pages of sitemaps to expect based on pair sitemap page size.
 */
async function getPairSitemaps(fetch: Fetch) {
	const datasets = await fetchPublicApi(fetch, 'datasets');
	const pairUniverse = datasets.find((d: any) => d.designation === 'pair_universe');
	const pages = Math.ceil(pairUniverse.entries / PAIR_SITEMAP_PAGE_SIZE);
	return Array.from({ length: pages }).map((_, page) => `api/sitemap/pairs/paged/${page}.xml`);
}

export async function GET({ fetch, setHeaders, url }) {
	const sitemaps = [...baseSitemaps, ...(await getPairSitemaps(fetch))];
	const sitemapUrls = sitemaps.map((sm) => new URL(sm, url).href);

	const stream = new SitemapIndexStream();
	Readable.from(sitemapUrls).pipe(stream);

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
