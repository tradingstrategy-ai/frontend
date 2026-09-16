/**
 * Generate sitemap index with entries for all the sitemaps
 *
 * The backend's paged pair sitemaps (`api/sitemap/pairs/paged/N.xml`) are deliberately not
 * listed: most pair pages carry `noindex` (see `$lib/explorer/indexing`) and submitting them
 * only produces Search Console conflicts and wasted crawl budget. See docs/google-webmasters.md.
 */
import { SitemapIndexStream } from 'sitemap';
import { Readable } from 'stream';

const sitemaps = [
	// served by frontend
	'sitemap-static.xml',
	'blog/sitemap.xml',
	'glossary/sitemap.xml',
	'strategies/sitemap.xml',
	'trading-view/blockchains/sitemap.xml',
	'vaults/sitemap.xml',

	// served by documentation site
	'docs/sitemap-docs.xml',

	// served by backend
	'api/sitemap/exchanges/sitemap.xml'
];

export function GET({ setHeaders, url }) {
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
