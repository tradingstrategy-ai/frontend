/**
 * Generate sitemap index with entries for all the sitemaps
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

	// served by documentation site
	'docs/sitemap-docs.xml',

	// served by backend
	'api/sitemap/exchanges/sitemap.xml',
	'api/sitemap/pairs/paged/0.xml',
	'api/sitemap/pairs/paged/1.xml',
	'api/sitemap/pairs/paged/2.xml',
	'api/sitemap/pairs/paged/3.xml',
	'api/sitemap/pairs/paged/4.xml'
];

export async function GET({ setHeaders, url }) {
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
