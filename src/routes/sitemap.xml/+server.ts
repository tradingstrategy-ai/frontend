/**
 * Generate sitemap index with entries for all the sitemaps
 */
import { backendUrl } from '$lib/config';
import { SitemapIndexStream } from 'sitemap';
import { Readable } from 'stream';

const baseSitemaps = [
	// served by frontend
	'sitemap-static.xml',
	'blog/sitemap.xml',
	'glossary/sitemap.xml',
	'strategies/sitemap.xml',
	'trading-view/blockchains/sitemap.xml',
	'trading-view/vaults/sitemap.xml',

	// served by documentation site
	'docs/sitemap-docs.xml',

	// served by backend
	'api/sitemap/exchanges/sitemap.xml'
];

/**
 * Find all paged pair sitemaps by checking for their existence on backend
 */
async function getPairSitemaps(fetch: Fetch) {
	let pageCount = 0;

	while (pageCount < 20) {
		// check if sitemap for this page exists then increment to find last page
		if (await sitemapExists(fetch, `${backendUrl}/sitemap/pairs/paged/${pageCount}.xml`)) {
			pageCount += 1;
		} else {
			break;
		}
	}

	return Array.from({ length: pageCount }).map((_, page) => `api/sitemap/pairs/paged/${page}.xml`);
}

/**
 * Confirm if a given sitemap URL actually exists on backend server
 */
async function sitemapExists(fetch: Fetch, sitemapUrl: string) {
	try {
		return (await fetch(sitemapUrl, { method: 'HEAD' })).ok;
	} catch {
		return false;
	}
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
